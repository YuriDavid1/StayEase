using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayEase.Api.Data;
using StayEase.Api.Dtos;
using StayEase.Api.Models;

namespace StayEase.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReservationsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReservationsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetActiveReservations()
    {
        try
        {
            var reservations = await GetReservations()
                .Where(r => !r.IsCancelled && r.ActualCheckOut == null)
                .ToListAsync();
            return Ok(reservations);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllReservations()
    {
        try
        {
            var reservations = await GetReservations().ToListAsync();
            return Ok(reservations);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    private IQueryable<Reservation> GetReservations()
    {
        return _db.Reservations
                .AsNoTracking()
                .Include(r => r.Room)
                .Include(r => r.Guest);
    }

    [HttpPost]
    public async Task<IActionResult> CreateReservation(CreateReservationDto dto)
    {
        try
        {
            var reservation = new Reservation
            {
                RoomId = dto.RoomId,
                GuestId = dto.GuestId,
                ScheduledCheckIn = dto.ScheduledCheckIn,
                ScheduledCheckOut = dto.ScheduledCheckOut
            };
            await _db.Reservations.AddAsync(reservation);
            await _db.SaveChangesAsync();
            return Ok(reservation);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/check-in")]
    public async Task<IActionResult> CheckIn(int id)
    {
        try
        {
            var reservation = await GetReservationById(id);
            if (reservation == null)
                return NotFound(new { message = "Reservation not found" });

            reservation.CheckIn();
            await _db.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/check-out")]
    public async Task<IActionResult> CheckOut(int id)
    {
        try
        {
            var reservation = await GetReservationById(id);
            if (reservation == null)
                return NotFound(new { message = "Reservation not found" });

            reservation.CheckOut();
            await _db.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        try
        {
            Reservation reservation = await GetReservationById(id);
            if (reservation == null)
                return NotFound(new { message = "Reservation not found" });

            reservation.Cancel();
            await _db.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    private async Task<Reservation> GetReservationById(int id)
    {
        return await _db.Reservations.FindAsync(id);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetReservation(int id)
    {
        try
        {
            var reservation = await GetReservations()
                .FirstOrDefaultAsync(r => r.ReservationId == id);
            if (reservation == null)
                return NotFound(new { message = "Reservation not found" });
            return Ok(reservation);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("guest/{guestId}")]
    public async Task<IActionResult> GetReservationsByGuest(int guestId)
    {
        try
        {
            var reservations = await GetReservations()
                .Where(r => r.GuestId == guestId)
                .ToListAsync();
            return Ok(reservations);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("room/{roomId}")]
    public async Task<IActionResult> GetReservationsByRoom(int roomId)
    {
        try
        {
            var reservations = await GetReservations()
                .Where(r => r.RoomId == roomId)
                .ToListAsync();
            return Ok(reservations);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
