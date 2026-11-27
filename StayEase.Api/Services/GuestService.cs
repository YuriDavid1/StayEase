using Microsoft.EntityFrameworkCore;
using StayEase.Api.Data;
using StayEase.Api.Dtos;
using StayEase.Api.Exceptions;
using StayEase.Api.Models;

namespace StayEase.Api.Services;

public class GuestService : IGuestService
{
    private readonly AppDbContext _db;

    public GuestService(AppDbContext db)
    {
        _db = db;
    }

    public Task<List<Guest>> GetAllAsync()
    {
        return _db.Guests.AsNoTracking().ToListAsync();
    }

    public async Task<Guest> CreateAsync(CreateGuestDto dto)
    {
        var guest = new Guest
        {
            Name = dto.Name,
            Document = dto.Document,
            Contact = dto.Contact
        };
        await _db.Guests.AddAsync(guest);
        await _db.SaveChangesAsync();
        return guest;
    }

    public async Task<Guest?> UpdateAsync(int id, UpdateGuestDto dto)
    {
        var guest = await _db.Guests.FindAsync(id);
        if (guest == null)
        {
            return null;
        }
        guest.Name = dto.Name;
        guest.Document = dto.Document;
        guest.Contact = dto.Contact;
        await _db.SaveChangesAsync();
        return guest;
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var guest = await _db.Guests.FindAsync(id);
        if (guest == null)
        {
            return false;
        }
        if (await _db.Reservations.AnyAsync(r => r.GuestId == id))
        {
            throw new ConflictException("O hóspede possui histórico de reservas e não pode ser excluído.");
        }
        _db.Guests.Remove(guest);
        await _db.SaveChangesAsync();
        return true;
    }
}
