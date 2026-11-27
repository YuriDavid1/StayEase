using StayEase.Api.Dtos;
using StayEase.Api.Models;

namespace StayEase.Api.Services;

public interface IReservationService
{
    /// <summary>Reservations that are neither cancelled nor checked out.</summary>
    Task<List<Reservation>> GetActiveAsync();

    Task<List<Reservation>> GetAllAsync();

    Task<Reservation?> GetByIdAsync(int id);

    Task<List<Reservation>> GetByGuestAsync(int guestId);

    Task<List<Reservation>> GetByRoomAsync(int roomId);

    /// <exception cref="Exceptions.BadRequestException">Invalid dates, room or guest.</exception>
    /// <exception cref="Exceptions.ConflictException">The room is already booked in the period.</exception>
    Task<Reservation> CreateAsync(CreateReservationDto dto);

    /// <summary>Registers the check-in and marks the room as Occupied. The room must be Available.</summary>
    /// <returns>False when the reservation does not exist.</returns>
    Task<bool> CheckInAsync(int id);

    /// <summary>Registers the check-out and marks the room as PendingCleaning for housekeeping.</summary>
    /// <returns>False when the reservation does not exist.</returns>
    Task<bool> CheckOutAsync(int id);

    /// <returns>False when the reservation does not exist.</returns>
    Task<bool> CancelAsync(int id);
}
