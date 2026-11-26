using System.ComponentModel.DataAnnotations;
using StayEase.Api.Models;

namespace StayEase.Api.Dtos;

public record LoginDto([Required] string Email, [Required] string Password);

public record CurrentUserDto(int UserId, string Email, UserRole Role);

public record LoginResponseDto(string Token, DateTime ExpiresAt, CurrentUserDto User);
