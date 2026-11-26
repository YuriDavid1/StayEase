using Microsoft.EntityFrameworkCore;
using StayEase.Api.Exceptions;
using StayEase.Api.Models;
using StayEase.Api.Services;

namespace StayEase.Tests.Services;

public class DeleteRestrictionTests
{
    private static async Task<(Room room, Guest guest)> SeedReservation(Api.Data.AppDbContext db)
    {
        var room = new Room { Number = "101", Type = "Standard", Capacity = 2 };
        var guest = new Guest { Name = "João", Document = "111", Contact = "47999999999" };
        db.AddRange(room, guest);
        await db.SaveChangesAsync();

        db.Reservations.Add(new Reservation
        {
            RoomId = room.RoomId,
            GuestId = guest.GuestId,
            ScheduledCheckIn = DateTime.UtcNow.AddDays(-3),
            ScheduledCheckOut = DateTime.UtcNow.AddDays(-1),
            ActualCheckIn = DateTime.UtcNow.AddDays(-3),
            ActualCheckOut = DateTime.UtcNow.AddDays(-1)
        });
        await db.SaveChangesAsync();

        return (room, guest);
    }

    [Fact]
    public async Task DeleteRoom_ComHistoricoDeReservas_DeveLancarConflitoEManterDados()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();
        var (room, _) = await SeedReservation(db);
        var service = new RoomService(db);

        // Act + Assert
        await Assert.ThrowsAsync<ConflictException>(() => service.DeleteAsync(room.RoomId));

        Assert.NotNull(await db.Rooms.FindAsync(room.RoomId));
        Assert.Equal(1, await db.Reservations.CountAsync());
    }

    [Fact]
    public async Task DeleteGuest_ComHistoricoDeReservas_DeveLancarConflitoEManterDados()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();
        var (_, guest) = await SeedReservation(db);
        var service = new GuestService(db);

        // Act + Assert
        await Assert.ThrowsAsync<ConflictException>(() => service.DeleteAsync(guest.GuestId));

        Assert.NotNull(await db.Guests.FindAsync(guest.GuestId));
        Assert.Equal(1, await db.Reservations.CountAsync());
    }

    [Fact]
    public void Modelo_ReservaDeveUsarDeleteRestrictParaQuartoEHospede()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        // Act
        var foreignKeys = db.Model.FindEntityType(typeof(Reservation))!.GetForeignKeys().ToList();

        // Assert
        Assert.Equal(2, foreignKeys.Count);
        Assert.All(foreignKeys, fk => Assert.Equal(DeleteBehavior.Restrict, fk.DeleteBehavior));
    }
}
