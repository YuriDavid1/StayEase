using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using StayEase.Api.Dtos;
using StayEase.Api.Models;

namespace StayEase.Tests.Integration;

public class AuthorizationTests : IDisposable
{
    private readonly StayEaseApiFactory _factory = new();

    public void Dispose() => _factory.Dispose();

    private static readonly CreateRoomDto NewRoom = new("901", "Standard", 2, 200m);

    [Theory]
    [InlineData(UserRole.Receptionist)]
    [InlineData(UserRole.Housekeeping)]
    [InlineData(UserRole.Guest)]
    public async Task Users_SomenteAdministrador_DemaisPerfisRecebem403(UserRole role)
    {
        var client = await _factory.CreateClientAsAsync(role);

        var response = await client.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Users_Administrador_PodeListar()
    {
        var client = await _factory.CreateClientAsAsync(UserRole.Administrator);

        var response = await client.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Theory]
    [InlineData(UserRole.Receptionist)]
    [InlineData(UserRole.Housekeeping)]
    [InlineData(UserRole.Guest)]
    public async Task Rooms_CadastroSomenteAdministrador(UserRole role)
    {
        var client = await _factory.CreateClientAsAsync(role);

        var response = await client.PostAsJsonAsync("/api/rooms", NewRoom);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Theory]
    [InlineData(UserRole.Administrator)]
    [InlineData(UserRole.Receptionist)]
    [InlineData(UserRole.Housekeeping)]
    [InlineData(UserRole.Guest)]
    public async Task Rooms_ListagemPermitidaParaQualquerUsuarioLogado(UserRole role)
    {
        var client = await _factory.CreateClientAsAsync(role);

        var response = await client.GetAsync("/api/rooms");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Theory]
    [InlineData(UserRole.Administrator, HttpStatusCode.NoContent)]
    [InlineData(UserRole.Housekeeping, HttpStatusCode.NoContent)]
    [InlineData(UserRole.Receptionist, HttpStatusCode.Forbidden)]
    [InlineData(UserRole.Guest, HttpStatusCode.Forbidden)]
    public async Task FinishCleaning_SomenteAdministradorEGovernanca(UserRole role, HttpStatusCode expected)
    {
        // Arrange
        var room = new Room { Number = "101", Type = "Standard", Capacity = 2, Status = RoomStatus.PendingCleaning };
        await _factory.SeedAsync(db => db.Rooms.Add(room));
        var client = await _factory.CreateClientAsAsync(role);

        // Act
        var response = await client.PatchAsync($"/api/rooms/{room.RoomId}/finish-cleaning", null);

        // Assert
        Assert.Equal(expected, response.StatusCode);
    }

    [Theory]
    [InlineData(UserRole.Housekeeping)]
    [InlineData(UserRole.Guest)]
    public async Task Guests_CadastroSomenteRecepcaoEAdministrador(UserRole role)
    {
        var client = await _factory.CreateClientAsAsync(role);

        var response = await client.PostAsJsonAsync("/api/guests", new CreateGuestDto("Ana", "123", "47999999999"));

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Reservations_GovernancaNaoPodeFazerCheckIn()
    {
        var client = await _factory.CreateClientAsAsync(UserRole.Housekeeping);

        var response = await client.PatchAsync("/api/reservations/1/check-in", null);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task ErroDeNegocio_DeveChegarAoClienteComoProblemDetails()
    {
        // Arrange
        var client = await _factory.CreateClientAsAsync(UserRole.Receptionist);
        var day = new DateTime(2030, 1, 10, 0, 0, 0, DateTimeKind.Utc);

        // Act: check-out before check-in
        var response = await client.PostAsJsonAsync("/api/reservations",
            new CreateReservationDto(1, 1, day, day.AddDays(-1)));
        var problem = await response.Content.ReadFromJsonAsync<JsonElement>();

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.Contains("saída", problem.GetProperty("detail").GetString());
    }

    [Fact]
    public async Task Rooms_DiariaNegativa_DeveRetornar400()
    {
        var client = await _factory.CreateClientAsAsync(UserRole.Administrator);

        var response = await client.PostAsJsonAsync("/api/rooms", NewRoom with { DailyRate = -1m });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
