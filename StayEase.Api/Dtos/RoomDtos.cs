using StayEase.Api.Models;

namespace StayEase.Api.Dtos;

public record CreateRoomDto(string Number, string Type, int Capacity);

public record UpdateRoomDto(string Number, string Type, int Capacity, RoomStatus Status);
