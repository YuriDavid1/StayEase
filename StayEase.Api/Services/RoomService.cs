using Microsoft.EntityFrameworkCore;
using StayEase.Api.Data;
using StayEase.Api.Dtos;
using StayEase.Api.Exceptions;
using StayEase.Api.Models;

namespace StayEase.Api.Services;

public class RoomService : IRoomService
{
    private readonly AppDbContext _db;

    public RoomService(AppDbContext db)
    {
        _db = db;
    }

    public Task<List<Room>> GetAllAsync()
    {
        return _db.Rooms.AsNoTracking().ToListAsync();
    }

    public async Task<Room> CreateAsync(CreateRoomDto dto)
    {
        var room = new Room
        {
            Number = dto.Number,
            Type = dto.Type,
            Capacity = dto.Capacity,
            DailyRate = dto.DailyRate,
            Status = RoomStatus.Available
        };
        await _db.Rooms.AddAsync(room);
        await _db.SaveChangesAsync();
        return room;
    }

    public async Task<Room?> UpdateAsync(int id, UpdateRoomDto dto)
    {
        var room = await _db.Rooms.FindAsync(id);
        if (room == null)
        {
            return null;
        }
        room.Number = dto.Number;
        room.Type = dto.Type;
        room.Capacity = dto.Capacity;
        room.Status = dto.Status;
        room.DailyRate = dto.DailyRate;
        await _db.SaveChangesAsync();
        return room;
    }

    public async Task<bool> FinishCleaningAsync(int id)
    {
        var room = await _db.Rooms.FindAsync(id);
        if (room == null)
        {
            return false;
        }
        if (room.Status != RoomStatus.PendingCleaning)
        {
            throw new ConflictException($"O quarto {room.Number} não está aguardando limpeza.");
        }
        room.Status = RoomStatus.Available;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var room = await _db.Rooms.FindAsync(id);
        if (room == null)
        {
            return false;
        }
        if (await _db.Reservations.AnyAsync(r => r.RoomId == id))
        {
            throw new ConflictException("O quarto possui histórico de reservas e não pode ser excluído.");
        }
        _db.Rooms.Remove(room);
        await _db.SaveChangesAsync();
        return true;
    }
}
