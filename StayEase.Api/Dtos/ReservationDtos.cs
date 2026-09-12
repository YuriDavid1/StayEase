namespace StayEase.Api.Dtos;

public record CreateReservationDto(int RoomId, int GuestId, DateTime ScheduledCheckIn, DateTime ScheduledCheckOut);