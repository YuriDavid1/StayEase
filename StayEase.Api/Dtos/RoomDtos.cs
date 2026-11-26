using System.ComponentModel.DataAnnotations;
using StayEase.Api.Models;

namespace StayEase.Api.Dtos;

public record CreateRoomDto(
    string Number,
    string Type,
    int Capacity,
    [Range(typeof(decimal), "0", "100000")] decimal DailyRate);

public record UpdateRoomDto(
    string Number,
    string Type,
    int Capacity,
    RoomStatus Status,
    [Range(typeof(decimal), "0", "100000")] decimal DailyRate);
