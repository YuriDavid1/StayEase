using StayEase.Api.Dtos;
using StayEase.Api.Models;

namespace StayEase.Api.Services;

public interface IGuestService
{
    Task<List<Guest>> GetAllAsync();

    Task<Guest> CreateAsync(CreateGuestDto dto);

    /// <returns>The updated guest, or null when it does not exist.</returns>
    Task<Guest?> UpdateAsync(int id, UpdateGuestDto dto);

    /// <returns>False when the guest does not exist.</returns>
    /// <exception cref="Exceptions.ConflictException">The guest has reservations.</exception>
    Task<bool> DeleteAsync(int id);
}
