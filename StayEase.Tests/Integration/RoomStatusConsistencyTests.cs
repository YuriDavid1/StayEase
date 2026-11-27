using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using StayEase.Api.Data;
using StayEase.Api.Dtos;
using StayEase.Api.Models;

namespace StayEase.Tests.Integration;

/// <summary>
/// Alteração manual do status do quarto (cenário T09 / risco R06 do relatório da Etapa 3).
///
/// O status do quarto deve mudar pelos fluxos de check-in (Ocupado), check-out (Limpeza
/// Pendente) e finish-cleaning (Livre). Hoje PUT /api/rooms/{id} grava qualquer Status enviado
/// pelo administrador, então é possível marcar como Livre um quarto com hóspede, abrindo espaço
/// para um segundo check-in no mesmo quarto.
///
/// Os testes de bloqueio descrevem o comportamento esperado (409 e status inalterado) e estão
/// com Skip até a correção. Os testes de controle rodam sempre e garantem que a edição dos
/// demais campos continua funcionando.
///
/// Atenção ao corrigir: RoomsControllerTests.UpdateRoom_DeveAlterarTodosOsCampos muda o status
/// de Livre para Limpeza Pendente via PUT. Essa transição não está coberta aqui e precisa de
/// decisão do PO (pode ser legítima, por exemplo quarto que precisa de limpeza extra).
/// </summary>
[Trait("Bloqueio", "R06")]
public class RoomStatusConsistencyTests : IDisposable
{
    private const string BlockedByR06 =
        "R06: PUT /api/rooms/{id} aceita Status arbitrário; aguardando correção no RoomService.UpdateAsync.";

    private static readonly DateTime Day = new(2030, 1, 10, 0, 0, 0, DateTimeKind.Utc);

    private readonly StayEaseApiFactory _factory = new();

    public void Dispose() => _factory.Dispose();

    /// <summary>Status atual do quarto e status que o administrador tenta gravar manualmente.</summary>
    public static TheoryData<RoomStatus, RoomStatus> ManualChangesThatBypassTheFlow() => new()
    {
        // Quarto com hóspede: só o check-out pode tirá-lo de Ocupado.
        { RoomStatus.Occupied, RoomStatus.Available },
        { RoomStatus.Occupied, RoomStatus.PendingCleaning },
        // Quarto aguardando limpeza: só o finish-cleaning (Governança) pode liberá-lo.
        { RoomStatus.PendingCleaning, RoomStatus.Available },
        // Quarto livre: só o check-in pode ocupá-lo.
        { RoomStatus.Available, RoomStatus.Occupied },
    };

    [Theory(Skip = BlockedByR06)]
    [MemberData(nameof(ManualChangesThatBypassTheFlow))]
    public async Task T09_AlteracaoManualDeStatus_DeveSerBloqueada(RoomStatus current, RoomStatus requested)
    {
        // Arrange
        var room = await SeedRoomAsync(current);
        var client = await _factory.CreateClientAsAsync(UserRole.Administrator);

        // Act
        var response = await client.PutAsJsonAsync($"/api/rooms/{room.RoomId}",
            new UpdateRoomDto(room.Number, room.Type, room.Capacity, requested, room.DailyRate));

        // Assert
        Assert.True(
            response.StatusCode == HttpStatusCode.Conflict,
            $"PUT de {current} para {requested}: esperado 409, recebido {(int)response.StatusCode}.");
        Assert.Equal(current, await GetRoomStatusAsync(room.RoomId));
    }

    [Fact(Skip = BlockedByR06)]
    public async Task T09_QuartoLiberadoManualmente_NaoDevePermitirSegundoCheckIn()
    {
        // Arrange: quarto ocupado por um hóspede e uma segunda reserva confirmada para ele
        var room = await SeedRoomAsync(RoomStatus.Occupied);
        var second = new Reservation
        {
            RoomId = room.RoomId,
            Guest = new Guest { Name = "Segundo Hóspede", Document = "T09-B", Contact = "47900000000" },
            ScheduledCheckIn = Day.AddDays(1),
            ScheduledCheckOut = Day.AddDays(3)
        };
        await _factory.SeedAsync(db => db.Reservations.Add(second));
        var admin = await _factory.CreateClientAsAsync(UserRole.Administrator);
        var reception = await _factory.CreateClientAsAsync(UserRole.Receptionist);

        // Act
        await admin.PutAsJsonAsync($"/api/rooms/{room.RoomId}",
            new UpdateRoomDto(room.Number, room.Type, room.Capacity, RoomStatus.Available, room.DailyRate));
        var checkIn = await reception.PatchAsync($"/api/reservations/{second.ReservationId}/check-in", null);

        // Assert
        Assert.True(
            checkIn.StatusCode == HttpStatusCode.Conflict,
            $"Segundo check-in em quarto ocupado: esperado 409, recebido {(int)checkIn.StatusCode}.");
    }

    // ---------------------------------------------------------------- Controles

    [Theory]
    [InlineData(RoomStatus.Available)]
    [InlineData(RoomStatus.Occupied)]
    [InlineData(RoomStatus.PendingCleaning)]
    public async Task Controle_EdicaoSemMudarStatus_DeveAtualizarDemaisCampos(RoomStatus status)
    {
        // Arrange
        var room = await SeedRoomAsync(status);
        var client = await _factory.CreateClientAsAsync(UserRole.Administrator);

        // Act
        var response = await client.PutAsJsonAsync($"/api/rooms/{room.RoomId}",
            new UpdateRoomDto("502", "Suite", 4, status, 350m));

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        using var scope = _factory.Services.CreateScope();
        var saved = await scope.ServiceProvider.GetRequiredService<AppDbContext>()
            .Rooms.AsNoTracking().SingleAsync(r => r.RoomId == room.RoomId);
        Assert.Equal(("502", "Suite", 4, 350m, status),
            (saved.Number, saved.Type, saved.Capacity, saved.DailyRate, saved.Status));
    }

    // ---------------------------------------------------------------- Helpers

    /// <summary>
    /// Cria um quarto no status pedido. Quarto Ocupado recebe uma reserva hospedada, para
    /// refletir um estado real do sistema.
    /// </summary>
    private async Task<Room> SeedRoomAsync(RoomStatus status)
    {
        var room = new Room { Number = "501", Type = "Standard", Capacity = 2, DailyRate = 200m, Status = status };
        await _factory.SeedAsync(db =>
        {
            db.Rooms.Add(room);
            if (status == RoomStatus.Occupied)
            {
                db.Reservations.Add(new Reservation
                {
                    Room = room,
                    Guest = new Guest { Name = "Hóspede T09", Document = "T09-A", Contact = "47900000000" },
                    ScheduledCheckIn = Day,
                    ScheduledCheckOut = Day.AddDays(2),
                    ActualCheckIn = Day
                });
            }
        });
        return room;
    }

    private async Task<RoomStatus> GetRoomStatusAsync(int roomId)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return (await db.Rooms.AsNoTracking().SingleAsync(r => r.RoomId == roomId)).Status;
    }
}
