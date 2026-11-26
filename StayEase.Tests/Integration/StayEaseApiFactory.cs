using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using StayEase.Api.Data;
using StayEase.Api.Dtos;
using StayEase.Api.Models;
using StayEase.Api.Services;

namespace StayEase.Tests.Integration;

/// <summary>
/// Runs the real API pipeline (authentication, authorization, exception handler) over an
/// in-memory database instead of PostgreSQL.
/// </summary>
public class StayEaseApiFactory : WebApplicationFactory<Program>
{
    public const string JwtKey = "integration-tests-signing-key-with-more-than-32-bytes";

    private readonly string _databaseName = Guid.NewGuid().ToString();
    private readonly Dictionary<string, string?> _settings = new()
    {
        ["Jwt:Key"] = JwtKey,
        ["Auth:LoginAttemptsPerMinute"] = "1000"
    };

    public StayEaseApiFactory WithSetting(string key, string? value)
    {
        _settings[key] = value;
        return this;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");
        foreach (var (key, value) in _settings)
        {
            builder.UseSetting(key, value);
        }

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<AppDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<AppDbContext>>();
            services.AddDbContext<AppDbContext>(options => options.UseInMemoryDatabase(_databaseName));
        });
    }

    public async Task<User> CreateUserAsync(string email, UserRole role, string password = "Senha@123")
    {
        using var scope = Services.CreateScope();
        var users = scope.ServiceProvider.GetRequiredService<IUserService>();
        return await users.CreateAsync(new CreateUserDto(email, role, password));
    }

    public async Task SeedAsync(Action<AppDbContext> seed)
    {
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        seed(db);
        await db.SaveChangesAsync();
    }

    /// <summary>Creates a user with the given role and returns a client authenticated as it.</summary>
    public async Task<HttpClient> CreateClientAsAsync(UserRole role)
    {
        var email = $"{role.ToString().ToLowerInvariant()}-{Guid.NewGuid():N}@stayease.com";
        await CreateUserAsync(email, role);

        var client = CreateClient();
        var login = await client.PostAsJsonAsync("/api/auth/login", new LoginDto(email, "Senha@123"));
        login.EnsureSuccessStatusCode();
        var body = await login.Content.ReadFromJsonAsync<LoginResponseDto>();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body!.Token);
        return client;
    }
}
