using StayEase.Api.Dtos;

namespace StayEase.Api.Services;

public interface IAuthService
{
    /// <returns>A signed token, or null when the credentials are invalid.</returns>
    Task<LoginResponseDto?> LoginAsync(LoginDto dto);
}
