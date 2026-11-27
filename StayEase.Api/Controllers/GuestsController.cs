using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StayEase.Api.Auth;
using StayEase.Api.Dtos;
using StayEase.Api.Services;

namespace StayEase.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
public class GuestsController : ControllerBase
{
    private readonly IGuestService _guestService;

    public GuestsController(IGuestService guestService)
    {
        _guestService = guestService;
    }

    [HttpGet]
    [Authorize(Roles = Roles.FrontDeskAndGuest)]
    public async Task<IActionResult> GetGuests()
    {
        return Ok(await _guestService.GetAllAsync());
    }

    [HttpPost]
    [Authorize(Roles = Roles.FrontDesk)]
    public async Task<IActionResult> AddGuest(CreateGuestDto dto)
    {
        return Ok(await _guestService.CreateAsync(dto));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = Roles.FrontDesk)]
    public async Task<IActionResult> UpdateGuest(int id, UpdateGuestDto dto)
    {
        var guest = await _guestService.UpdateAsync(id, dto);
        return guest == null ? NotFound(new { message = "Guest not found" }) : NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = Roles.FrontDesk)]
    public async Task<IActionResult> DeleteGuest(int id)
    {
        return await _guestService.DeleteAsync(id)
            ? NoContent()
            : NotFound(new { message = "Guest not found" });
    }
}
