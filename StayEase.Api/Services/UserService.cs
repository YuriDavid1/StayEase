using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StayEase.Api.Data;
using StayEase.Api.Dtos;
using StayEase.Api.Exceptions;
using StayEase.Api.Models;

namespace StayEase.Api.Services;

public class UserService : IUserService
{
    public const int MinPasswordLength = 8;

    private readonly AppDbContext _db;
    private readonly IPasswordHasher<User> _passwordHasher;

    public UserService(AppDbContext db, IPasswordHasher<User> passwordHasher)
    {
        _db = db;
        _passwordHasher = passwordHasher;
    }

    public static string NormalizeEmail(string email) => email.Trim().ToLowerInvariant();

    public Task<List<User>> GetAllAsync()
    {
        return _db.Users.AsNoTracking().ToListAsync();
    }

    public Task<User?> GetByIdAsync(int id)
    {
        return _db.Users.AsNoTracking().FirstOrDefaultAsync(u => u.UserId == id);
    }

    public async Task<User> CreateAsync(CreateUserDto dto)
    {
        var email = NormalizeEmail(dto.Email ?? string.Empty);
        if (email.Length == 0)
        {
            throw new BadRequestException("Informe o e-mail do usuário.");
        }
        if (await _db.Users.AnyAsync(u => u.Email.ToLower() == email))
        {
            throw new ConflictException("Já existe um usuário com este e-mail.");
        }

        var user = new User
        {
            Email = email,
            Role = dto.Role
        };
        SetPassword(user, dto.Password);

        await _db.Users.AddAsync(user);
        await _db.SaveChangesAsync();
        return user;
    }

    public async Task<User?> UpdateAsync(int id, UpdateUserDto dto)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
        {
            return null;
        }
        if (user.Role == UserRole.Administrator && dto.Role != UserRole.Administrator)
        {
            await EnsureAnotherAdministratorExistsAsync(user.UserId);
        }

        user.Role = dto.Role;
        if (dto.Password != null)
        {
            SetPassword(user, dto.Password);
        }
        await _db.SaveChangesAsync();
        return user;
    }

    public async Task<User?> DeleteAsync(int id)
    {
        var user = await _db.Users.FindAsync(id);
        if (user == null)
        {
            return null;
        }
        if (user.Role == UserRole.Administrator)
        {
            await EnsureAnotherAdministratorExistsAsync(user.UserId);
        }
        _db.Users.Remove(user);
        await _db.SaveChangesAsync();
        return user;
    }

    private void SetPassword(User user, string? password)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < MinPasswordLength)
        {
            throw new BadRequestException($"A senha deve ter pelo menos {MinPasswordLength} caracteres.");
        }
        user.PasswordHash = _passwordHasher.HashPassword(user, password);
    }

    /// <summary>Prevents locking everyone out by removing or demoting the last administrator.</summary>
    private async Task EnsureAnotherAdministratorExistsAsync(int userId)
    {
        var hasAnotherAdmin = await _db.Users.AnyAsync(u =>
            u.UserId != userId && u.Role == UserRole.Administrator && u.PasswordHash != null);

        if (!hasAnotherAdmin)
        {
            throw new ConflictException("Não é possível remover o último administrador do sistema.");
        }
    }
}
