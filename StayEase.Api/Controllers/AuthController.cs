using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.JsonWebTokens;
using StayEase.Api.Dtos;
using StayEase.Api.Services;

namespace StayEase.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class AuthController : ControllerBase
{
    public const string LoginRateLimitPolicy = "login";

    private readonly IAuthService _authService;
    private readonly IUserService _userService;

    public AuthController(IAuthService authService, IUserService userService)
    {
        _authService = authService;
        _userService = userService;
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting(LoginRateLimitPolicy)]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var response = await _authService.LoginAsync(dto);
        if (response == null)
        {
            // Same answer for unknown e-mail and wrong password.
            return Problem(statusCode: StatusCodes.Status401Unauthorized,
                title: "Unauthorized", detail: "E-mail ou senha inválidos.");
        }
        return Ok(response);
    }

    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        if (!int.TryParse(User.FindFirstValue(JwtRegisteredClaimNames.Sub), out var userId))
        {
            return Unauthorized();
        }

        // Reads the database so a deleted user is rejected even with a valid token.
        var user = await _userService.GetByIdAsync(userId);
        return user == null ? Unauthorized() : Ok(new CurrentUserDto(user.UserId, user.Email, user.Role));
    }
}
