using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using StayEase.Api.Data;
using StayEase.Api.Models;

namespace StayEase.Tests.Integration;

/// <summary>
/// Transições de estado da reserva pela API (cenário T12 do relatório da Etapa 3).
///
/// As regras já são testadas no domínio (ReservationStateTransitionTests). Aqui verificamos o
/// que o cliente recebe: a tabela completa estado × ação, o código HTTP, o corpo ProblemDetails
/// nos conflitos e que nem a reserva nem o quarto mudam quando a transição é recusada.
/// </summary>
public class ReservationTransitionHttpTests : IDisposable
{
    private static readonly DateTime Day = new(2030, 1, 10, 0, 0, 0, DateTimeKind.Utc);

    private readonly StayEaseApiFactory _factory = new();

    public void Dispose() => _factory.Dispose();

    /// <summary>
    /// Estado inicial, ação, resposta esperada e estado final esperado da reserva e do quarto.
    /// Nos casos 409 o estado final é igual ao inicial.
    /// </summary>
    public static TheoryData<ReservationStatus, string, HttpStatusCode, ReservationStatus, RoomStatus> Transitions() => new()
    {
        // Confirmada
        { ReservationStatus.Confirmed, "check-in", HttpStatusCode.NoContent, ReservationStatus.CheckedIn, RoomStatus.Occupied },
        { ReservationStatus.Confirmed, "check-out", HttpStatusCode.Conflict, ReservationStatus.Confirmed, RoomStatus.Available },
        { ReservationStatus.Confirmed, "cancel", HttpStatusCode.NoContent, ReservationStatus.Cancelled, RoomStatus.Available },

        // Hospedada
        { ReservationStatus.CheckedIn, "check-in", HttpStatusCode.Conflict, ReservationStatus.CheckedIn, RoomStatus.Occupied },
        { ReservationStatus.CheckedIn, "check-out", HttpStatusCode.NoContent, ReservationStatus.CheckedOut, RoomStatus.PendingCleaning },
        { ReservationStatus.CheckedIn, "cancel", HttpStatusCode.Conflict, ReservationStatus.CheckedIn, RoomStatus.Occupied },

        // Finalizada
        { ReservationStatus.CheckedOut, "check-in", HttpStatusCode.Conflict, ReservationStatus.CheckedOut, RoomStatus.PendingCleaning },
        { ReservationStatus.CheckedOut, "check-out", HttpStatusCode.Conflict, ReservationStatus.CheckedOut, RoomStatus.PendingCleaning },
        { ReservationStatus.CheckedOut, "cancel", HttpStatusCode.Conflict, ReservationStatus.CheckedOut, RoomStatus.PendingCleaning },

        // Cancelada (novo cancelamento é idempotente)
        { ReservationStatus.Cancelled, "check-in", HttpStatusCode.Conflict, ReservationStatus.Cancelled, RoomStatus.Available },
        { ReservationStatus.Cancelled, "check-out", HttpStatusCode.Conflict, ReservationStatus.Cancelled, RoomStatus.Available },
        { ReservationStatus.Cancelled, "cancel", HttpStatusCode.NoContent, ReservationStatus.Cancelled, RoomStatus.Available },
    };

    [Theory]
    [MemberData(nameof(Transitions))]
    public async Task Transicao_DeveRetornarCodigoEEstadoEsperados(
        ReservationStatus initial,
        string action,
        HttpStatusCode expectedStatus,
        ReservationStatus expectedReservation,
        RoomStatus expectedRoom)
    {
        // Arrange
        var reservationId = await SeedReservationAsync(initial);
        var client = await _factory.CreateClientAsAsync(UserRole.Receptionist);

        // Act
        var response = await client.PatchAsync($"/api/reservations/{reservationId}/{action}", null);

        // Assert
        Assert.Equal(expectedStatus, response.StatusCode);
        Assert.Equal((expectedReservation, expectedRoom), await GetStateAsync(reservationId));

        if (expectedStatus == HttpStatusCode.Conflict)
        {
            Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
            var problem = await response.Content.ReadFromJsonAsync<JsonElement>();
            Assert.Equal(409, problem.GetProperty("status").GetInt32());
            Assert.False(string.IsNullOrWhiteSpace(problem.GetProperty("detail").GetString()));
        }
    }

    [Theory]
    [InlineData("check-in")]
    [InlineData("check-out")]
    [InlineData("cancel")]
    public async Task Transicao_EmReservaInexistente_DeveRetornar404(string action)
    {
        var client = await _factory.CreateClientAsAsync(UserRole.Receptionist);

        var response = await client.PatchAsync($"/api/reservations/999/{action}", null);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    /// <summary>Cria quarto, hóspede e reserva coerentes com o estado pedido.</summary>
    private async Task<int> SeedReservationAsync(ReservationStatus status)
    {
        var room = new Room
        {
            Number = "401",
            Type = "Standard",
            Capacity = 2,
            DailyRate = 200m,
            Status = status switch
            {
                ReservationStatus.CheckedIn => RoomStatus.Occupied,
                ReservationStatus.CheckedOut => RoomStatus.PendingCleaning,
                _ => RoomStatus.Available
            }
        };
        var reservation = new Reservation
        {
            Room = room,
            Guest = new Guest { Name = "Hóspede T12", Document = "T12", Contact = "47900000000" },
            ScheduledCheckIn = Day,
            ScheduledCheckOut = Day.AddDays(2),
            ActualCheckIn = status is ReservationStatus.CheckedIn or ReservationStatus.CheckedOut ? Day : null,
            ActualCheckOut = status == ReservationStatus.CheckedOut ? Day.AddDays(2) : null,
            IsCancelled = status == ReservationStatus.Cancelled
        };

        await _factory.SeedAsync(db => db.Reservations.Add(reservation));

        Assert.Equal(status, reservation.Status);
        return reservation.ReservationId;
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
