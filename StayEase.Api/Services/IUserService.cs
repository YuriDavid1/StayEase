using StayEase.Api.Dtos;
using StayEase.Api.Models;

namespace StayEase.Api.Services;

public interface IUserService
{
    Task<List<User>> GetAllAsync();

    Task<User?> GetByIdAsync(int id);

    /// <exception cref="Exceptions.BadRequestException">Missing e-mail or weak password.</exception>
    /// <exception cref="Exceptions.ConflictException">The e-mail is already in use.</exception>
    Task<User> CreateAsync(CreateUserDto dto);

    /// <returns>The updated user, or null when it does not exist.</returns>
    /// <exception cref="Exceptions.ConflictException">It would demote the last administrator.</exception>
    Task<User?> UpdateAsync(int id, UpdateUserDto dto);

    /// <returns>The removed user, or null when it does not exist.</returns>
    /// <exception cref="Exceptions.ConflictException">It is the last administrator.</exception>
    Task<User?> DeleteAsync(int id);
}
