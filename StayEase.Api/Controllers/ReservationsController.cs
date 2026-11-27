using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StayEase.Api.Auth;
using StayEase.Api.Dtos;
using StayEase.Api.Services;

namespace StayEase.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ReservationsController : ControllerBase
{
    private readonly IReservationService _reservationService;

    public ReservationsController(IReservationService reservationService)
    {
        _reservationService = reservationService;
    }

    [HttpGet]
    public async Task<IActionResult> GetActiveReservations()
    {
        return Ok(await _reservationService.GetActiveAsync());
    }

    [HttpGet("all")]
    public async Task<IActionResult> GetAllReservations()
    {
        return Ok(await _reservationService.GetAllAsync());
    }

    [HttpPost]
    [Authorize(Roles = Roles.FrontDeskAndGuest)]
    public async Task<IActionResult> CreateReservation(CreateReservationDto dto)
    {
        return Ok(await _reservationService.CreateAsync(dto));
    }

    [HttpPatch("{id}/check-in")]
    [Authorize(Roles = Roles.FrontDeskAndGuest)]
    public async Task<IActionResult> CheckIn(int id)
    {
        return await _reservationService.CheckInAsync(id) ? NoContent() : ReservationNotFound();
    }

    [HttpPatch("{id}/check-out")]
    [Authorize(Roles = Roles.FrontDeskAndGuest)]
    public async Task<IActionResult> CheckOut(int id)
    {
        return await _reservationService.CheckOutAsync(id) ? NoContent() : ReservationNotFound();
    }

    [HttpPatch("{id}/cancel")]
    [Authorize(Roles = Roles.FrontDeskAndGuest)]
    public async Task<IActionResult> Cancel(int id)
    {
        return await _reservationService.CancelAsync(id) ? NoContent() : ReservationNotFound();
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetReservation(int id)
    {
        var reservation = await _reservationService.GetByIdAsync(id);
        return reservation == null ? ReservationNotFound() : Ok(reservation);
    }

    [HttpGet("guest/{guestId}")]
    public async Task<IActionResult> GetReservationsByGuest(int guestId)
    {
        return Ok(await _reservationService.GetByGuestAsync(guestId));
    }

    [HttpGet("room/{roomId}")]
    public async Task<IActionResult> GetReservationsByRoom(int roomId)
    {
        return Ok(await _reservationService.GetByRoomAsync(roomId));
    }

    private NotFoundObjectResult ReservationNotFound()
    {
        return NotFound(new { message = "Reservation not found" });
    }
}
