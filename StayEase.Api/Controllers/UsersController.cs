using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StayEase.Api.Auth;
using StayEase.Api.Dtos;
using StayEase.Api.Services;

namespace StayEase.Api.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize(Roles = Roles.Administrator)]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        return Ok(await _userService.GetAllAsync());
    }

    [HttpPost]
    public async Task<IActionResult> AddUser(CreateUserDto dto)
    {
        return Ok(await _userService.CreateAsync(dto));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(int id, UpdateUserDto dto)
    {
        var user = await _userService.UpdateAsync(id, dto);
        return user == null ? NotFound(new { message = "User not found" }) : Ok(user);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(int id)
    {
        var user = await _userService.DeleteAsync(id);
        return user == null ? NotFound(new { message = "User not found" }) : Ok(user);
    }
}
