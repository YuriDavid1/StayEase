using System.Data;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using StayEase.Api.Data;
using StayEase.Api.Dtos;
using StayEase.Api.Exceptions;
using StayEase.Api.Models;

namespace StayEase.Api.Services;

public class ReservationService : IReservationService
{
    private readonly AppDbContext _db;

    public ReservationService(AppDbContext db)
    {
        _db = db;
    }

    private IQueryable<Reservation> QueryWithDetails()
    {
        return _db.Reservations
            .AsNoTracking()
            .Include(r => r.Room)
            .Include(r => r.Guest);
    }

    public Task<List<Reservation>> GetActiveAsync()
    {
        return QueryWithDetails()
            .Where(r => !r.IsCancelled && r.ActualCheckOut == null)
            .ToListAsync();
    }

    public Task<List<Reservation>> GetAllAsync()
    {
        return QueryWithDetails().ToListAsync();
    }

    public Task<Reservation?> GetByIdAsync(int id)
    {
        return QueryWithDetails().FirstOrDefaultAsync(r => r.ReservationId == id);
    }

    public Task<List<Reservation>> GetByGuestAsync(int guestId)
    {
        return QueryWithDetails().Where(r => r.GuestId == guestId).ToListAsync();
    }

    public Task<List<Reservation>> GetByRoomAsync(int roomId)
    {
        return QueryWithDetails().Where(r => r.RoomId == roomId).ToListAsync();
    }

    public async Task<Reservation> CreateAsync(CreateReservationDto dto)
    {
        if (dto.ScheduledCheckOut <= dto.ScheduledCheckIn)
        {
            throw new BadRequestException("A data de saída deve ser posterior à data de entrada.");
        }

        // Serializable makes PostgreSQL abort one of two concurrent requests that both
        // passed the overlap check for the same room, so overbooking cannot slip through.
        await using var transaction = _db.Database.IsRelational()
            ? await _db.Database.BeginTransactionAsync(IsolationLevel.Serializable)
            : null;

        if (!await _db.Rooms.AnyAsync(r => r.RoomId == dto.RoomId))
        {
            throw new BadRequestException($"Quarto {dto.RoomId} não encontrado.");
        }
        if (!await _db.Guests.AnyAsync(g => g.GuestId == dto.GuestId))
        {
            throw new BadRequestException($"Hóspede {dto.GuestId} não encontrado.");
        }
        if (await HasOverlappingReservationAsync(dto.RoomId, dto.ScheduledCheckIn, dto.ScheduledCheckOut))
        {
            throw new ConflictException("Já existe uma reserva para este quarto no período informado.");
        }

        var reservation = new Reservation
        {
            RoomId = dto.RoomId,
            GuestId = dto.GuestId,
            ScheduledCheckIn = dto.ScheduledCheckIn,
            ScheduledCheckOut = dto.ScheduledCheckOut
        };
        await _db.Reservations.AddAsync(reservation);

        try
        {
            await _db.SaveChangesAsync();
            if (transaction != null)
            {
                await transaction.CommitAsync();
            }
        }
        catch (Exception ex) when (IsSerializationFailure(ex))
        {
            throw new ConflictException("Outra reserva para este quarto foi registrada ao mesmo tempo. Tente novamente.");
        }

        return reservation;
    }

    /// <summary>
    /// A reservation blocks the room from its scheduled check-in until its scheduled check-out,
    /// unless it was cancelled or the guest already checked out. Periods are half-open, so a
    /// new stay may start on the day the previous one ends.
    /// </summary>
    private Task<bool> HasOverlappingReservationAsync(int roomId, DateTime checkIn, DateTime checkOut)
    {
        return _db.Reservations.AnyAsync(r =>
            r.RoomId == roomId &&
            !r.IsCancelled &&
            r.ActualCheckOut == null &&
            r.ScheduledCheckIn < checkOut &&
            checkIn < r.ScheduledCheckOut);
    }

    private static bool IsSerializationFailure(Exception ex)
    {
        return (ex as PostgresException ?? ex.InnerException as PostgresException)?.SqlState
            == PostgresErrorCodes.SerializationFailure;
    }

    // Check-in and check-out update the reservation and the room status in the same
    // SaveChanges call, so both changes are committed in a single transaction.

    public async Task<bool> CheckInAsync(int id)
    {
        var reservation = await FindWithRoomAsync(id);
        if (reservation == null)
        {
            return false;
        }
        var room = reservation.Room!;

        if (reservation.Status == ReservationStatus.Confirmed && room.Status != RoomStatus.Available)
        {
            throw new ConflictException(
                $"O quarto {room.Number} não está livre para check-in (status atual: {RoomStatusLabel(room.Status)}).");
        }

        reservation.CheckIn();
        room.Status = RoomStatus.Occupied;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> CheckOutAsync(int id)
    {
        var reservation = await FindWithRoomAsync(id);
        if (reservation == null)
        {
            return false;
        }

        reservation.CheckOut();
        reservation.Room!.Status = RoomStatus.PendingCleaning;
        await _db.SaveChangesAsync();
        return true;
    }

    private Task<Reservation?> FindWithRoomAsync(int id)
    {
        // Room is a required navigation, so Include guarantees it is loaded.
        return _db.Reservations
            .Include(r => r.Room)
            .FirstOrDefaultAsync(r => r.ReservationId == id);
    }

    private static string RoomStatusLabel(RoomStatus status) => status switch
    {
        RoomStatus.Available => "Livre",
        RoomStatus.Occupied => "Ocupado",
        RoomStatus.PendingCleaning => "Limpeza Pendente",
        _ => status.ToString()
    };

    public async Task<bool> CancelAsync(int id)
    {
        var reservation = await _db.Reservations.FindAsync(id);
        if (reservation == null)
        {
            return false;
        }
        reservation.Cancel();
        await _db.SaveChangesAsync();
        return true;
    }
}
