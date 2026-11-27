using StayEase.Api.Dtos;
using StayEase.Api.Models;

namespace StayEase.Api.Services;

public interface IRoomService
{
    Task<List<Room>> GetAllAsync();

    Task<Room> CreateAsync(CreateRoomDto dto);

    /// <returns>The updated room, or null when it does not exist.</returns>
    Task<Room?> UpdateAsync(int id, UpdateRoomDto dto);

    /// <summary>Housekeeping finished cleaning: PendingCleaning -> Available.</summary>
    /// <returns>False when the room does not exist.</returns>
    /// <exception cref="Exceptions.ConflictException">The room is not pending cleaning.</exception>
    Task<bool> FinishCleaningAsync(int id);

    /// <returns>False when the room does not exist.</returns>
    /// <exception cref="Exceptions.ConflictException">The room has reservations.</exception>
    Task<bool> DeleteAsync(int id);
}
