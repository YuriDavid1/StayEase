using Microsoft.AspNetCore.Identity;
using StayEase.Api.Data;
using StayEase.Api.Dtos;
using StayEase.Api.Exceptions;
using StayEase.Api.Models;
using StayEase.Api.Services;

namespace StayEase.Tests.Services;

public class UserServiceTests
{
    private readonly PasswordHasher<User> _hasher = new();

    private UserService CreateService(AppDbContext db) => new(db, _hasher);

    [Fact]
    public async Task Create_DeveGuardarSomenteOHashDaSenha()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        // Act
        var user = await CreateService(db).CreateAsync(
            new CreateUserDto("Admin@StayEase.com", UserRole.Administrator, "Senha@123"));

        // Assert
        Assert.Equal("admin@stayease.com", user.Email);
        Assert.NotNull(user.PasswordHash);
        Assert.DoesNotContain("Senha@123", user.PasswordHash);
        Assert.Equal(PasswordVerificationResult.Success,
            _hasher.VerifyHashedPassword(user, user.PasswordHash!, "Senha@123"));
    }

    [Theory]
    [InlineData("")]
    [InlineData("1234567")]
    public async Task Create_ComSenhaFraca_DeveLancarBadRequest(string password)
    {
        using var db = TestDbContextFactory.Create();

        await Assert.ThrowsAsync<BadRequestException>(() =>
            CreateService(db).CreateAsync(new CreateUserDto("a@stayease.com", UserRole.Receptionist, password)));
        Assert.Empty(db.Users);
    }

    [Fact]
    public async Task Create_ComEmailDuplicado_DeveLancarConflito()
    {
        using var db = TestDbContextFactory.Create();
        var service = CreateService(db);
        await service.CreateAsync(new CreateUserDto("a@stayease.com", UserRole.Receptionist, "Senha@123"));

        await Assert.ThrowsAsync<ConflictException>(() =>
            service.CreateAsync(new CreateUserDto("A@STAYEASE.COM", UserRole.Housekeeping, "Senha@123")));
    }

    [Fact]
    public async Task Update_ComNovaSenha_DeveTrocarOHash()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();
        var service = CreateService(db);
        var user = await service.CreateAsync(new CreateUserDto("a@stayease.com", UserRole.Receptionist, "Senha@123"));

        // Act
        await service.UpdateAsync(user.UserId, new UpdateUserDto(UserRole.Receptionist, "NovaSenha@456"));

        // Assert
        Assert.Equal(PasswordVerificationResult.Success,
            _hasher.VerifyHashedPassword(user, user.PasswordHash!, "NovaSenha@456"));
    }

    [Fact]
    public async Task Update_SemSenha_DeveManterSenhaAtual()
    {
        using var db = TestDbContextFactory.Create();
        var service = CreateService(db);
        var user = await service.CreateAsync(new CreateUserDto("a@stayease.com", UserRole.Receptionist, "Senha@123"));
        var originalHash = user.PasswordHash;

        await service.UpdateAsync(user.UserId, new UpdateUserDto(UserRole.Housekeeping));

        Assert.Equal(originalHash, user.PasswordHash);
        Assert.Equal(UserRole.Housekeeping, user.Role);
    }

    [Fact]
    public async Task Delete_UltimoAdministrador_DeveLancarConflito()
    {
        using var db = TestDbContextFactory.Create();
        var service = CreateService(db);
        var admin = await service.CreateAsync(new CreateUserDto("admin@stayease.com", UserRole.Administrator, "Senha@123"));

        await Assert.ThrowsAsync<ConflictException>(() => service.DeleteAsync(admin.UserId));
        Assert.Single(db.Users);
    }

    [Fact]
    public async Task Update_RebaixarUltimoAdministrador_DeveLancarConflito()
    {
        using var db = TestDbContextFactory.Create();
        var service = CreateService(db);
        var admin = await service.CreateAsync(new CreateUserDto("admin@stayease.com", UserRole.Administrator, "Senha@123"));

        await Assert.ThrowsAsync<ConflictException>(() =>
            service.UpdateAsync(admin.UserId, new UpdateUserDto(UserRole.Receptionist)));
    }

    [Fact]
    public async Task Delete_AdministradorComOutroAdministrador_DevePermitir()
    {
        using var db = TestDbContextFactory.Create();
        var service = CreateService(db);
        var admin = await service.CreateAsync(new CreateUserDto("admin1@stayease.com", UserRole.Administrator, "Senha@123"));
        await service.CreateAsync(new CreateUserDto("admin2@stayease.com", UserRole.Administrator, "Senha@123"));

        var removed = await service.DeleteAsync(admin.UserId);

        Assert.NotNull(removed);
        Assert.Single(db.Users);
    }
}
