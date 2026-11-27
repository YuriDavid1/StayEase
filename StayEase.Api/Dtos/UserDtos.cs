using System.ComponentModel.DataAnnotations;
using StayEase.Api.Models;

namespace StayEase.Api.Dtos;

public record CreateUserDto([Required, EmailAddress] string Email, UserRole Role, [Required] string Password);

/// <param name="Password">When informed, replaces the user's password.</param>
public record UpdateUserDto(UserRole Role, string? Password = null);
