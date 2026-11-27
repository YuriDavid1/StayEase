using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using StayEase.Api.Dtos;
using StayEase.Api.Models;

namespace StayEase.Api.Auth;

public interface ITokenService
{
    LoginResponseDto CreateToken(User user);
}

public class TokenService : ITokenService
{
    public const string RoleClaim = "role";

    private readonly JwtOptions _options;

    public TokenService(JwtOptions options)
    {
        _options = options;
    }

    public static SymmetricSecurityKey CreateSigningKey(JwtOptions options)
    {
        return new SymmetricSecurityKey(Encoding.UTF8.GetBytes(options.Key));
    }

    public LoginResponseDto CreateToken(User user)
    {
        var now = DateTime.UtcNow;
        var expiresAt = now.AddMinutes(_options.ExpirationMinutes);

        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = _options.Issuer,
            Audience = _options.Audience,
            IssuedAt = now,
            NotBefore = now,
            Expires = expiresAt,
            Subject = new ClaimsIdentity(
            [
                new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(RoleClaim, user.Role.ToString())
            ]),
            SigningCredentials = new SigningCredentials(CreateSigningKey(_options), SecurityAlgorithms.HmacSha256)
        };

        var token = new JsonWebTokenHandler().CreateToken(descriptor);

        return new LoginResponseDto(token, expiresAt, new CurrentUserDto(user.UserId, user.Email, user.Role));
    }
}
