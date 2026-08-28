using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayEase.Api.Data;
using StayEase.Api.Dtos;
using StayEase.Api.Models;

namespace StayEase.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GuestsController : ControllerBase
{
    private readonly AppDbContext _db;

    public GuestsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetGuests()
    {
        try
        {
            var guests = await _db.Guests.AsNoTracking().ToListAsync();
            return Ok(guests);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> AddGuest(CreateGuestDto dto)
    {
        try
        {
            var guest = new Guest
            {
                Name = dto.Name,
                Document = dto.Document,
                Contact = dto.Contact
            };
            await _db.Guests.AddAsync(guest);
            await _db.SaveChangesAsync();
            return Ok(guest);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateGuest(int id, UpdateGuestDto dto)
    {
        try
        {
            var guest = await _db.Guests.FindAsync(id);
            if (guest == null)
            {
                return NotFound(new { message = "Guest not found" });
            }
            guest.Name = dto.Name;
            guest.Document = dto.Document;
            guest.Contact = dto.Contact;
            _db.Guests.Update(guest);
            await _db.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGuest(int id)
    {
        try
        {
            var guest = await _db.Guests.FindAsync(id);
            if (guest == null)
            {
                return NotFound(new { message = "Guest not found" });
            }
            _db.Guests.Remove(guest);
            await _db.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
