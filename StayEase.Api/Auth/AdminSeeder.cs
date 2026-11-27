using Microsoft.EntityFrameworkCore;
using StayEase.Api.Data;
using StayEase.Api.Dtos;
using StayEase.Api.Models;
using StayEase.Api.Services;

namespace StayEase.Api.Auth;

/// <summary>
/// Creates the first administrator from configuration (Seed:AdminEmail / Seed:AdminPassword),
/// so a fresh database is not left without anyone able to log in. Does nothing when an
/// administrator with a password already exists or when the settings are not provided.
/// </summary>
public static class AdminSeeder
{
    public static async Task SeedAsync(IServiceProvider services, IConfiguration configuration, ILogger logger)
    {
        var email = configuration["Seed:AdminEmail"];
        var password = configuration["Seed:AdminPassword"];
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
        {
            return;
        }

        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        var users = scope.ServiceProvider.GetRequiredService<IUserService>();

        if (await db.Users.AnyAsync(u => u.Role == UserRole.Administrator && u.PasswordHash != null))
        {
            return;
        }

        var normalizedEmail = UserService.NormalizeEmail(email);
        var existing = await db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

        if (existing == null)
        {
            await users.CreateAsync(new CreateUserDto(normalizedEmail, UserRole.Administrator, password));
        }
        else
        {
            await users.UpdateAsync(existing.UserId, new UpdateUserDto(UserRole.Administrator, password));
        }

        logger.LogWarning("Initial administrator {Email} created from configuration. Change its password and remove Seed:AdminPassword.", normalizedEmail);
    }
}
