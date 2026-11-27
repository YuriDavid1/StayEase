using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StayEase.Api.Auth;
using StayEase.Api.Data;
using StayEase.Api.Dtos;
using StayEase.Api.Models;

namespace StayEase.Api.Services;

public class AuthService : IAuthService
{
    // Verified when the e-mail does not exist, so the response time does not reveal
    // which e-mails are registered.
    private static readonly User DummyUser = new();
    private static readonly string DummyHash =
        new PasswordHasher<User>().HashPassword(DummyUser, Guid.NewGuid().ToString());

    private readonly AppDbContext _db;
    private readonly IPasswordHasher<User> _passwordHasher;
    private readonly ITokenService _tokenService;

    public AuthService(AppDbContext db, IPasswordHasher<User> passwordHasher, ITokenService tokenService)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
    }

    public async Task<LoginResponseDto?> LoginAsync(LoginDto dto)
    {
        var email = UserService.NormalizeEmail(dto.Email ?? string.Empty);
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email);

        if (user?.PasswordHash == null)
        {
            _passwordHasher.VerifyHashedPassword(DummyUser, DummyHash, dto.Password ?? string.Empty);
            return null;
        }

        var result = _passwordHasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password ?? string.Empty);
        if (result == PasswordVerificationResult.Failed)
        {
            return null;
        }
        if (result == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = _passwordHasher.HashPassword(user, dto.Password!);
            await _db.SaveChangesAsync();
        }

        return _tokenService.CreateToken(user);
    }
}
