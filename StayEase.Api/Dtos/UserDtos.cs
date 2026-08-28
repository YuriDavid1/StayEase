using StayEase.Api.Models;

namespace StayEase.Api.Dtos;

public record CreateUserDto(string Email, UserRole Role);

public record UpdateUserDto(UserRole Role);
