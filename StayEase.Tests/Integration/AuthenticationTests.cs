using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text;
using System.Text.Json;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using StayEase.Api.Dtos;
using StayEase.Api.Models;

namespace StayEase.Tests.Integration;

public class AuthenticationTests : IDisposable
{
    private readonly StayEaseApiFactory _factory = new();

    public void Dispose() => _factory.Dispose();

    [Theory]
    [InlineData("/api/rooms")]
    [InlineData("/api/guests")]
    [InlineData("/api/users")]
    [InlineData("/api/reservations")]
    [InlineData("/api/auth/me")]
    public async Task Endpoints_SemToken_DevemRetornar401(string url)
    {
        var response = await _factory.CreateClient().GetAsync(url);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Login_ComCredenciaisValidas_DeveRetornarTokenQueAcessaAApi()
    {
        // Arrange
        await _factory.CreateUserAsync("Recepcao@StayEase.com", UserRole.Receptionist);
        var client = _factory.CreateClient();

        // Act: e-mail is case insensitive
        var login = await client.PostAsJsonAsync("/api/auth/login", new LoginDto(" recepcao@stayease.com ", "Senha@123"));
        var body = await login.Content.ReadFromJsonAsync<LoginResponseDto>();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body!.Token);
        var me = await client.GetFromJsonAsync<CurrentUserDto>("/api/auth/me");

        // Assert
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        Assert.True(body.ExpiresAt > DateTime.UtcNow);
        Assert.Equal(UserRole.Receptionist, body.User.Role);
        Assert.Equal("recepcao@stayease.com", me!.Email);
    }

    [Fact]
    public async Task Login_ComSenhaErradaOuEmailInexistente_DeveRetornarMesmaResposta401()
    {
        // Arrange
        await _factory.CreateUserAsync("admin@stayease.com", UserRole.Administrator);
        var client = _factory.CreateClient();

        // Act
        var wrongPassword = await client.PostAsJsonAsync("/api/auth/login", new LoginDto("admin@stayease.com", "errada123"));
        var unknownEmail = await client.PostAsJsonAsync("/api/auth/login", new LoginDto("ninguem@stayease.com", "errada123"));

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, wrongPassword.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, unknownEmail.StatusCode);
        Assert.Equal(await Detail(wrongPassword), await Detail(unknownEmail));
    }

    [Fact]
    public async Task Login_UsuarioSemSenha_NaoDeveAutenticar()
    {
        // Users created before authentication existed have no password hash.
        await _factory.SeedAsync(db => db.Users.Add(new User { Email = "antigo@stayease.com", Role = UserRole.Administrator }));

        var response = await _factory.CreateClient()
            .PostAsJsonAsync("/api/auth/login", new LoginDto("antigo@stayease.com", "qualquer-senha"));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Token_AssinadoComOutraChave_DeveSerRejeitado()
    {
        // Arrange: valid claims, wrong signature
        var forged = new JsonWebTokenHandler().CreateToken(new SecurityTokenDescriptor
        {
            Issuer = "StayEase.Api",
            Audience = "StayEase.App",
            Expires = DateTime.UtcNow.AddHours(1),
            Subject = new ClaimsIdentity([new Claim("sub", "1"), new Claim("role", "Administrator")]),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(new string('x', 64))), SecurityAlgorithms.HmacSha256)
        });
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", forged);

        // Act
        var response = await client.GetAsync("/api/users");

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Users_ListagemNaoDeveExporHashDeSenha()
    {
        var client = await _factory.CreateClientAsAsync(UserRole.Administrator);

        var json = await client.GetStringAsync("/api/users");

        Assert.DoesNotContain("password", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("AQAAAA", json); // PasswordHasher v3 prefix
    }

    [Fact]
    public async Task Login_AcimaDoLimitePorMinuto_DeveRetornar429()
    {
        // Arrange
        using var factory = new StayEaseApiFactory().WithSetting("Auth:LoginAttemptsPerMinute", "3");
        var client = factory.CreateClient();
        var dto = new LoginDto("admin@stayease.com", "errada123");

        // Act
        var statuses = new List<HttpStatusCode>();
        for (var i = 0; i < 4; i++)
        {
            statuses.Add((await client.PostAsJsonAsync("/api/auth/login", dto)).StatusCode);
        }

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, statuses[2]);
        Assert.Equal(HttpStatusCode.TooManyRequests, statuses[3]);
    }

    [Fact]
    public async Task AdminSeeder_ComConfiguracao_DeveCriarPrimeiroAdministrador()
    {
        // Arrange
        using var factory = new StayEaseApiFactory()
            .WithSetting("Seed:AdminEmail", "dono@stayease.com")
            .WithSetting("Seed:AdminPassword", "SenhaInicial@1");

        // Act
        var login = await factory.CreateClient()
            .PostAsJsonAsync("/api/auth/login", new LoginDto("dono@stayease.com", "SenhaInicial@1"));
        var body = await login.Content.ReadFromJsonAsync<LoginResponseDto>();

        // Assert
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        Assert.Equal(UserRole.Administrator, body!.User.Role);
    }

    private static async Task<string?> Detail(HttpResponseMessage response)
    {
        var json = await response.Content.ReadFromJsonAsync<JsonElement>();
        return json.GetProperty("detail").GetString();
    }
}
