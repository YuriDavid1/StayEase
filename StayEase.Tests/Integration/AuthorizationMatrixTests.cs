using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Controllers;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using StayEase.Api.Dtos;
using StayEase.Api.Models;

namespace StayEase.Tests.Integration;

/// <summary>
/// Matriz de autorização por rota (cenário T13 do relatório da Etapa 3).
///
/// Cada rota declara os perfis que podem acessá-la. Para cada perfil:
/// - perfil permitido: a requisição passa pela autorização (resposta diferente de 401 e 403;
///   pode ser 200, 204, 400, 404 etc., conforme a regra de negócio);
/// - perfil não permitido: 403;
/// - sem token: 401.
///
/// As mutações usam IDs inexistentes (999) para que a autorização seja testada sem alterar
/// dados. O teste <see cref="Matriz_DeveCobrirTodasAsRotasDaApi"/> falha quando um endpoint
/// novo é criado sem entrar nesta matriz.
/// </summary>
public class AuthorizationMatrixTests : IClassFixture<AuthorizationMatrixTests.Fixture>
{
    private const string Anonymous = "Anonimo";

    private static readonly string[] All = [Roles.Admin, Roles.Reception, Roles.Housekeeping, Roles.Guest];
    private static readonly string[] AdminOnly = [Roles.Admin];
    private static readonly string[] FrontDesk = [Roles.Admin, Roles.Reception];
    private static readonly string[] FrontDeskAndGuest = [Roles.Admin, Roles.Reception, Roles.Guest];
    private static readonly string[] Cleaning = [Roles.Admin, Roles.Housekeeping];

    private static readonly DateTime Day = new(2030, 1, 10, 0, 0, 0, DateTimeKind.Utc);

    /// <param name="Template">Rota como declarada no controller, usada na verificação de cobertura.</param>
    /// <param name="Url">URL concreta usada na requisição.</param>
    /// <param name="Allowed">Perfis que devem passar pela autorização.</param>
    /// <param name="Undefined">
    /// Perfis cuja regra ainda não está definida (ficam fora desta matriz até a decisão de
    /// requisitos/PO; ver <see cref="PendingDecisions"/>).
    /// </param>
    public record RouteRule(
        string Method,
        string Template,
        string Url,
        string[] Allowed,
        object? Body = null,
        string[]? Undefined = null)
    {
        public override string ToString() => $"{Method} {Url}";
    }

    public static readonly RouteRule[] Matrix =
    [
        // Auth
        new("GET", "api/Auth/me", "/api/auth/me", All),

        // Rooms
        new("GET", "api/Rooms", "/api/rooms", All),
        new("POST", "api/Rooms", "/api/rooms", AdminOnly,
            new CreateRoomDto("901", "Standard", 2, 200m)),
        new("PUT", "api/Rooms/{id}", "/api/rooms/999", AdminOnly,
            new UpdateRoomDto("999", "Standard", 2, RoomStatus.Available, 200m)),
        new("PATCH", "api/Rooms/{id}/finish-cleaning", "/api/rooms/999/finish-cleaning", Cleaning),
        new("DELETE", "api/Rooms/{id}", "/api/rooms/999", AdminOnly),

        // Users
        new("GET", "api/Users", "/api/users", AdminOnly),
        new("POST", "api/Users", "/api/users", AdminOnly,
            new CreateUserDto("matriz@stayease.com", UserRole.Receptionist, "Senha@123")),
        new("PUT", "api/Users/{id}", "/api/users/999", AdminOnly,
            new UpdateUserDto(UserRole.Receptionist)),
        new("DELETE", "api/Users/{id}", "/api/users/999", AdminOnly),

        // Guests
        new("GET", "api/Guests", "/api/guests", FrontDesk, Undefined: [Roles.Guest]),
        new("POST", "api/Guests", "/api/guests", FrontDesk,
            new CreateGuestDto("Matriz", "999", "47999999999")),
        new("PUT", "api/Guests/{id}", "/api/guests/999", FrontDesk,
            new UpdateGuestDto("Matriz", "999", "47999999999")),
        new("DELETE", "api/Guests/{id}", "/api/guests/999", FrontDesk),

        // Reservations: escrita
        new("POST", "api/Reservations", "/api/reservations", FrontDeskAndGuest,
            new CreateReservationDto(999, 999, Day, Day.AddDays(2))),
        new("PATCH", "api/Reservations/{id}/check-in", "/api/reservations/999/check-in", FrontDeskAndGuest),
        new("PATCH", "api/Reservations/{id}/check-out", "/api/reservations/999/check-out", FrontDeskAndGuest),
        new("PATCH", "api/Reservations/{id}/cancel", "/api/reservations/999/cancel", FrontDeskAndGuest),

        // Reservations: leitura
        new("GET", "api/Reservations", "/api/reservations", FrontDesk,
            Undefined: [Roles.Housekeeping, Roles.Guest]),
        new("GET", "api/Reservations/all", "/api/reservations/all", FrontDesk,
            Undefined: [Roles.Housekeeping, Roles.Guest]),
        new("GET", "api/Reservations/{id}", "/api/reservations/999", FrontDesk,
            Undefined: [Roles.Housekeeping, Roles.Guest]),
        new("GET", "api/Reservations/guest/{guestId}", "/api/reservations/guest/999", FrontDesk,
            Undefined: [Roles.Housekeeping, Roles.Guest]),
        new("GET", "api/Reservations/room/{roomId}", "/api/reservations/room/999", FrontDesk,
            Undefined: [Roles.Housekeeping, Roles.Guest]),
    ];

    /// <summary>
    /// Células da matriz sem regra definida. Hoje esses GETs só exigem usuário autenticado,
    /// então Governança e Hóspede recebem 200 com dados de todos os hóspedes (R01).
    /// A regra esperada depende de M07 (vínculo User ↔ Guest) e de decisão de requisitos.
    /// Os testes de titularidade do Hóspede (T01–T04) ficam em outro arquivo.
    /// </summary>
    public static readonly string PendingDecisions =
        "GET /api/guests (Hóspede); GET /api/reservations* (Governança e Hóspede)";

    /// <summary>Endpoints que não exigem autenticação e por isso não entram na matriz.</summary>
    private static readonly HashSet<string> PublicEndpoints = ["POST api/Auth/login"];

    public static TheoryData<RouteRule, string> AuthenticatedCases()
    {
        var data = new TheoryData<RouteRule, string>();
        foreach (var rule in Matrix)
        {
            foreach (var role in All.Except(rule.Undefined ?? []))
            {
                data.Add(rule, role);
            }
        }
        return data;
    }

    public static TheoryData<RouteRule> AnonymousCases()
    {
        var data = new TheoryData<RouteRule>();
        foreach (var rule in Matrix)
        {
            data.Add(rule);
        }
        return data;
    }

    private readonly Fixture _fixture;

    public AuthorizationMatrixTests(Fixture fixture)
    {
        _fixture = fixture;
    }

    [Theory]
    [MemberData(nameof(AuthenticatedCases))]
    public async Task Rota_DeveRespeitarPerfil(RouteRule rule, string role)
    {
        // Act
        var response = await SendAsync(_fixture.Clients[role], rule);

        // Assert
        if (rule.Allowed.Contains(role))
        {
            Assert.True(
                response.StatusCode is not (HttpStatusCode.Unauthorized or HttpStatusCode.Forbidden),
                $"{rule} com perfil {role} deveria passar pela autorização, mas retornou {(int)response.StatusCode}.");
        }
        else
        {
            Assert.True(
                response.StatusCode == HttpStatusCode.Forbidden,
                $"{rule} com perfil {role} deveria retornar 403, mas retornou {(int)response.StatusCode}.");
        }
    }

    [Theory]
    [MemberData(nameof(AnonymousCases))]
    public async Task Rota_SemToken_DeveRetornar401(RouteRule rule)
    {
        var response = await SendAsync(_fixture.Clients[Anonymous], rule);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public void Matriz_DeveCobrirTodasAsRotasDaApi()
    {
        // Arrange
        var actions = _fixture.Factory.Services
            .GetRequiredService<IActionDescriptorCollectionProvider>()
            .ActionDescriptors.Items
            .OfType<ControllerActionDescriptor>();

        var apiEndpoints = actions
            .SelectMany(action => (action.EndpointMetadata
                    .OfType<HttpMethodMetadata>()
                    .FirstOrDefault()?.HttpMethods ?? [])
                .Select(method => $"{method} {action.AttributeRouteInfo?.Template}"))
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        var matrixEndpoints = Matrix
            .Select(rule => $"{rule.Method} {rule.Template}")
            .ToHashSet(StringComparer.OrdinalIgnoreCase);

        // Act
        var missing = apiEndpoints.Except(matrixEndpoints).Except(PublicEndpoints).Order().ToList();
        var stale = matrixEndpoints.Except(apiEndpoints).Order().ToList();

        // Assert
        Assert.True(missing.Count == 0, "Rotas sem regra na matriz: " + string.Join(", ", missing));
        Assert.True(stale.Count == 0, "Rotas da matriz que não existem mais na API: " + string.Join(", ", stale));
    }

    private static Task<HttpResponseMessage> SendAsync(HttpClient client, RouteRule rule)
    {
        var request = new HttpRequestMessage(new HttpMethod(rule.Method), rule.Url);
        if (rule.Body != null)
        {
            request.Content = JsonContent.Create(rule.Body, rule.Body.GetType());
        }
        return client.SendAsync(request);
    }

    private static class Roles
    {
        public const string Admin = nameof(UserRole.Administrator);
        public const string Reception = nameof(UserRole.Receptionist);
        public const string Housekeeping = nameof(UserRole.Housekeeping);
        public const string Guest = nameof(UserRole.Guest);
    }

    /// <summary>Uma API e um cliente autenticado por perfil, compartilhados pela matriz inteira.</summary>
    public sealed class Fixture : IAsyncLifetime
    {
        public StayEaseApiFactory Factory { get; } = new();

        public Dictionary<string, HttpClient> Clients { get; } = new();

        public async Task InitializeAsync()
        {
            foreach (var role in Enum.GetValues<UserRole>())
            {
                Clients[role.ToString()] = await Factory.CreateClientAsAsync(role);
            }
            Clients[Anonymous] = Factory.CreateClient();
        }

        public Task DisposeAsync()
        {
            Factory.Dispose();
            return Task.CompletedTask;
        }
    }
}
