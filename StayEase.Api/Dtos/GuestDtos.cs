namespace StayEase.Api.Dtos;

public record CreateGuestDto(string Name, string Document, string Contact);

public record UpdateGuestDto(string Name, string Document, string Contact);
