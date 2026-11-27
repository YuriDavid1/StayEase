using System.Net;
using System.Net.Http.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using StayEase.Api.Data;
using StayEase.Api.Dtos;
using StayEase.Api.Models;

namespace StayEase.Tests.Integration;

/// <summary>
/// Titularidade dos dados do perfil Hóspede (cenários T01–T04 / riscos R01 e R02 do
/// relatório da Etapa 3).
///
/// Um usuário Hóspede não pode ler nem alterar dados de outro hóspede. Hoje não existe vínculo
/// entre User e Guest (M07), então qualquer cadastro de hóspede é "de terceiro" para o usuário
/// logado, e a API expõe e altera esses dados. Os testes descrevem o comportamento esperado e
/// estão marcados com Skip até a correção; ao concluir M07, remova o Skip e ajuste o Arrange
/// para vincular o usuário ao próprio cadastro.
///
/// Os testes de controle (sem Skip) usam a Recepção para provar que os dados semeados existem
/// e são visíveis; sem eles, os testes de Hóspede poderiam passar por falta de dados.
/// </summary>
[Trait("Bloqueio", "M07")]
public class GuestOwnershipTests : IAsyncLifetime
{
    private const string BlockedByM07 =
        "R01/R02: bloqueado até M07 (vínculo User ↔ Guest e filtro por titularidade no servidor).";

    /// <summary>Documento do hóspede de terceiro; não pode aparecer em respostas para o Hóspede.</summary>
    private const string ThirdPartyDocument = "DOC-TERCEIRO-777";

    private static readonly DateTime Day = new(2030, 1, 10, 0, 0, 0, DateTimeKind.Utc);

    private readonly StayEaseApiFactory _factory = new();

    private Guest _thirdParty = null!;
    private Room _freeRoom = null!;
    private Reservation _confirmed = null!;
    private Reservation _checkedIn = null!;

    public async Task InitializeAsync()
    {
        _thirdParty = new Guest { Name = "Hóspede Terceiro", Document = ThirdPartyDocument, Contact = "47900000000" };
        _freeRoom = new Room { Number = "301", Type = "Standard", Capacity = 2, Status = RoomStatus.Available, DailyRate = 200m };
        var occupiedRoom = new Room { Number = "302", Type = "Standard", Capacity = 2, Status = RoomStatus.Occupied, DailyRate = 200m };
        var otherFreeRoom = new Room { Number = "303", Type = "Standard", Capacity = 2, Status = RoomStatus.Available, DailyRate = 200m };

        _confirmed = new Reservation
        {
            Room = _freeRoom,
            Guest = _thirdParty,
            ScheduledCheckIn = Day,
            ScheduledCheckOut = Day.AddDays(2)
        };
        _checkedIn = new Reservation
        {
            Room = occupiedRoom,
            Guest = _thirdParty,
            ScheduledCheckIn = Day,
            ScheduledCheckOut = Day.AddDays(2),
            ActualCheckIn = Day
        };

        await _factory.SeedAsync(db =>
        {
            db.Rooms.Add(otherFreeRoom);
            db.Reservations.AddRange(_confirmed, _checkedIn);
        });
    }

    public Task DisposeAsync()
    {
        _factory.Dispose();
        return Task.CompletedTask;
    }

    // ---------------------------------------------------------------- T01

    [Fact(Skip = BlockedByM07)]
    public async Task T01_Hospede_NaoDeveListarCadastrosDeTerceiros()
    {
        var client = await _factory.CreateClientAsAsync(UserRole.Guest);

        var response = await client.GetAsync("/api/guests");

        await AssertNoThirdPartyDataAsync(response, "GET /api/guests");
    }

    // ---------------------------------------------------------------- T02

    private static readonly string[] ReadTemplates =
    [
        "/api/reservations",
        "/api/reservations/all",
        "/api/reservations/{reservationId}",
        "/api/reservations/guest/{guestId}",
        "/api/reservations/room/{roomId}",
    ];

    public static TheoryData<string> ReadEndpoints() => new(ReadTemplates);

    [Theory(Skip = BlockedByM07)]
    [MemberData(nameof(ReadEndpoints))]
    public async Task T02_Hospede_NaoDeveLerReservasDeTerceiros(string template)
    {
        var client = await _factory.CreateClientAsAsync(UserRole.Guest);
        var url = Resolve(template);

        var response = await client.GetAsync(url);

        await AssertNoThirdPartyDataAsync(response, $"GET {url}");
    }

    // ---------------------------------------------------------------- T03

    [Fact(Skip = BlockedByM07)]
    public async Task T03_Hospede_NaoDeveCriarReservaEmNomeDeTerceiro()
    {
        // Arrange
        var client = await _factory.CreateClientAsAsync(UserRole.Guest);
        var before = await CountReservationsAsync(_thirdParty.GuestId);
        var dto = new CreateReservationDto(_freeRoom.RoomId, _thirdParty.GuestId, Day.AddDays(10), Day.AddDays(12));

        // Act
        var response = await client.PostAsJsonAsync("/api/reservations", dto);

        // Assert
        Assert.True(
            response.StatusCode is HttpStatusCode.Forbidden or HttpStatusCode.BadRequest,
            $"Esperado 403 ou 400, recebido {(int)response.StatusCode}.");
        Assert.Equal(before, await CountReservationsAsync(_thirdParty.GuestId));
    }

    // ---------------------------------------------------------------- T04

    public static TheoryData<string, string> WriteActions() => new()
    {
        { "check-in", "confirmed" },
        { "check-out", "checkedIn" },
        { "cancel", "confirmed" },
    };

    [Theory(Skip = BlockedByM07)]
    [MemberData(nameof(WriteActions))]
    public async Task T04_Hospede_NaoDeveAlterarReservaDeTerceiro(string action, string target)
    {
        // Arrange
        var client = await _factory.CreateClientAsAsync(UserRole.Guest);
        var reservation = target == "confirmed" ? _confirmed : _checkedIn;
        var before = await GetStateAsync(reservation.ReservationId);

        // Act
        var response = await client.PatchAsync($"/api/reservations/{reservation.ReservationId}/{action}", null);

        // Assert
        Assert.True(
            response.StatusCode is HttpStatusCode.Forbidden or HttpStatusCode.NotFound,
            $"PATCH {action} em reserva de terceiro: esperado 403 ou 404, recebido {(int)response.StatusCode}.");
        Assert.Equal(before, await GetStateAsync(reservation.ReservationId));
    }

    // ---------------------------------------------------------------- Controles

    [Fact]
    public async Task Controle_RecepcaoEnxergaOsDadosSemeados()
    {
        var client = await _factory.CreateClientAsAsync(UserRole.Receptionist);

        foreach (var url in ReadTemplates.Select(Resolve).Append("/api/guests"))
        {
            var response = await client.GetAsync(url);

            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
            Assert.Contains(ThirdPartyDocument, await response.Content.ReadAsStringAsync());
        }
    }

    [Theory]
    [MemberData(nameof(WriteActions))]
    public async Task Controle_RecepcaoConsegueExecutarAsMesmasAcoes(string action, string target)
    {
        var client = await _factory.CreateClientAsAsync(UserRole.Receptionist);
        var reservation = target == "confirmed" ? _confirmed : _checkedIn;
        var before = await GetStateAsync(reservation.ReservationId);

        var response = await client.PatchAsync($"/api/reservations/{reservation.ReservationId}/{action}", null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.NotEqual(before, await GetStateAsync(reservation.ReservationId));
    }

    // ---------------------------------------------------------------- Helpers

    private string Resolve(string template) => template
        .Replace("{reservationId}", _confirmed.ReservationId.ToString())
        .Replace("{guestId}", _thirdParty.GuestId.ToString())
        .Replace("{roomId}", _freeRoom.RoomId.ToString());

    /// <summary>Aceita 403/404 ou 200 sem nenhum dado do hóspede de terceiro.</summary>
    private static async Task AssertNoThirdPartyDataAsync(HttpResponseMessage response, string request)
    {
        if (response.StatusCode is HttpStatusCode.Forbidden or HttpStatusCode.NotFound)
        {
            return;
        }

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync();
        Assert.False(
            body.Contains(ThirdPartyDocument),
            $"{request} expôs dados de outro hóspede ao perfil Hóspede.");
    }

    private async Task<int> CountReservationsAsync(int guestId)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        return await db.Reservations.CountAsync(r => r.GuestId == guestId);
    }

    private async Task<(ReservationStatus Reservation, RoomStatus Room)> GetStateAsync(int reservationId)
    {
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var reservation = await db.Reservations
            .AsNoTracking()
            .Include(r => r.Room)
            .SingleAsync(r => r.ReservationId == reservationId);
        return (reservation.Status, reservation.Room!.Status);
    }
}
