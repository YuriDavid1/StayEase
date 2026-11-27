using StayEase.Api.Data;
using StayEase.Api.Dtos;
using StayEase.Api.Exceptions;
using StayEase.Api.Models;
using StayEase.Api.Services;

namespace StayEase.Tests.Services;

public class ReservationCreationValidationTests
{
    private static readonly DateTime Day1 = new(2030, 1, 10, 0, 0, 0, DateTimeKind.Utc);

    private static async Task<(Room room, Guest guest)> SeedRoomAndGuest(AppDbContext db)
    {
        var room = new Room { Number = "101", Type = "Standard", Capacity = 2 };
        var guest = new Guest { Name = "João", Document = "111", Contact = "47999999999" };
        db.AddRange(room, guest);
        await db.SaveChangesAsync();
        return (room, guest);
    }

    private static async Task SeedReservation(AppDbContext db, Room room, Guest guest,
        DateTime checkIn, DateTime checkOut, bool cancelled = false, bool checkedOut = false)
    {
        db.Reservations.Add(new Reservation
        {
            RoomId = room.RoomId,
            GuestId = guest.GuestId,
            ScheduledCheckIn = checkIn,
            ScheduledCheckOut = checkOut,
            IsCancelled = cancelled,
            ActualCheckIn = checkedOut ? checkIn : null,
            ActualCheckOut = checkedOut ? checkIn.AddDays(1) : null
        });
        await db.SaveChangesAsync();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public async Task Create_ComSaidaIgualOuAnteriorAEntrada_DeveLancarBadRequest(int nights)
    {
        // Arrange
        using var db = TestDbContextFactory.Create();
        var (room, guest) = await SeedRoomAndGuest(db);
        var service = new ReservationService(db);

        // Act + Assert
        await Assert.ThrowsAsync<BadRequestException>(() =>
            service.CreateAsync(new CreateReservationDto(room.RoomId, guest.GuestId, Day1, Day1.AddDays(nights))));
        Assert.Empty(db.Reservations);
    }

    [Fact]
    public async Task Create_ComQuartoInexistente_DeveLancarBadRequest()
    {
        using var db = TestDbContextFactory.Create();
        var (_, guest) = await SeedRoomAndGuest(db);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            new ReservationService(db).CreateAsync(new CreateReservationDto(999, guest.GuestId, Day1, Day1.AddDays(2))));
        Assert.Empty(db.Reservations);
    }

    [Fact]
    public async Task Create_ComHospedeInexistente_DeveLancarBadRequest()
    {
        using var db = TestDbContextFactory.Create();
        var (room, _) = await SeedRoomAndGuest(db);

        await Assert.ThrowsAsync<BadRequestException>(() =>
            new ReservationService(db).CreateAsync(new CreateReservationDto(room.RoomId, 999, Day1, Day1.AddDays(2))));
        Assert.Empty(db.Reservations);
    }

    [Theory]
    [InlineData(0, 3)]   // same period
    [InlineData(1, 1)]   // inside
    [InlineData(-1, 2)]  // overlaps the start
    [InlineData(2, 3)]   // overlaps the end
    [InlineData(-2, 7)]  // contains the existing one
    public async Task Create_ComPeriodoSobreposto_DeveLancarConflito(int startOffset, int nights)
    {
        // Arrange: existing reservation from Day1 to Day1+3
        using var db = TestDbContextFactory.Create();
        var (room, guest) = await SeedRoomAndGuest(db);
        await SeedReservation(db, room, guest, Day1, Day1.AddDays(3));
        var checkIn = Day1.AddDays(startOffset);

        // Act + Assert
        await Assert.ThrowsAsync<ConflictException>(() =>
            new ReservationService(db).CreateAsync(
                new CreateReservationDto(room.RoomId, guest.GuestId, checkIn, checkIn.AddDays(nights))));
        Assert.Single(db.Reservations);
    }

    [Theory]
    [InlineData(3, 2)]   // starts on the existing check-out day
    [InlineData(-2, 2)]  // ends on the existing check-in day
    public async Task Create_ComPeriodoAdjacente_DevePermitir(int startOffset, int nights)
    {
        using var db = TestDbContextFactory.Create();
        var (room, guest) = await SeedRoomAndGuest(db);
        await SeedReservation(db, room, guest, Day1, Day1.AddDays(3));
        var checkIn = Day1.AddDays(startOffset);

        await new ReservationService(db).CreateAsync(
            new CreateReservationDto(room.RoomId, guest.GuestId, checkIn, checkIn.AddDays(nights)));

        Assert.Equal(2, db.Reservations.Count());
    }

    [Fact]
    public async Task Create_ComReservaCanceladaNoPeriodo_DevePermitir()
    {
        using var db = TestDbContextFactory.Create();
        var (room, guest) = await SeedRoomAndGuest(db);
        await SeedReservation(db, room, guest, Day1, Day1.AddDays(3), cancelled: true);

        await new ReservationService(db).CreateAsync(
            new CreateReservationDto(room.RoomId, guest.GuestId, Day1, Day1.AddDays(3)));

        Assert.Equal(2, db.Reservations.Count());
    }

    [Fact]
    public async Task Create_ComHospedeQueJaFezCheckOutAntecipado_DevePermitir()
    {
        using var db = TestDbContextFactory.Create();
        var (room, guest) = await SeedRoomAndGuest(db);
        await SeedReservation(db, room, guest, Day1, Day1.AddDays(5), checkedOut: true);

        await new ReservationService(db).CreateAsync(
            new CreateReservationDto(room.RoomId, guest.GuestId, Day1.AddDays(2), Day1.AddDays(4)));

        Assert.Equal(2, db.Reservations.Count());
    }

    [Fact]
    public async Task Create_MesmoPeriodoEmOutroQuarto_DevePermitir()
    {
        using var db = TestDbContextFactory.Create();
        var (room, guest) = await SeedRoomAndGuest(db);
        var otherRoom = new Room { Number = "102", Type = "Standard", Capacity = 2 };
        db.Rooms.Add(otherRoom);
        await db.SaveChangesAsync();
        await SeedReservation(db, room, guest, Day1, Day1.AddDays(3));

        await new ReservationService(db).CreateAsync(
            new CreateReservationDto(otherRoom.RoomId, guest.GuestId, Day1, Day1.AddDays(3)));

        Assert.Equal(2, db.Reservations.Count());
    }
}
