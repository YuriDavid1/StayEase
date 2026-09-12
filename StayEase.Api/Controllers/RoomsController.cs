using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayEase.Api.Data;
using StayEase.Api.Dtos;
using StayEase.Api.Models;

namespace StayEase.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class RoomsController : ControllerBase
{
    private readonly AppDbContext _db;

    public RoomsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<IActionResult> GetRooms()
    {
        try
        {
            var rooms = await _db.Rooms.AsNoTracking().ToListAsync();
            return Ok(rooms);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPost]
    public async Task<IActionResult> AddRoom(CreateRoomDto dto)
    {
        try
        {
            var room = new Room
            {
                Number = dto.Number,
                Type = dto.Type,
                Capacity = dto.Capacity,
                Status = RoomStatus.Available
            };
            await _db.Rooms.AddAsync(room);
            await _db.SaveChangesAsync();
            return Ok(room);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRoom(int id, UpdateRoomDto dto)
    {
        try
        {
            Room room = await _db.Rooms.FindAsync(id);
            if (room == null)
            {
                return NotFound();
            }
            room.Number = dto.Number;
            room.Type = dto.Type;
            room.Capacity = dto.Capacity;
            room.Status = dto.Status;
            await _db.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRoom(int id)
    {
        try
        {
            Room room = await _db.Rooms.FindAsync(id);
            if (room == null)
            {
                return NotFound();
            }
            _db.Rooms.Remove(room);
            await _db.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}
