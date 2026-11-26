using StayEase.Api.Data;
using StayEase.Api.Exceptions;
using StayEase.Api.Models;
using StayEase.Api.Services;

namespace StayEase.Tests.Services;

public class RoomStatusFlowTests
{
    private static async Task<(Room room, Reservation reservation)> Seed(
        AppDbContext db,
        RoomStatus roomStatus = RoomStatus.Available,
        DateTime? actualCheckIn = null)
    {
        var room = new Room { Number = "101", Type = "Standard", Capacity = 2, Status = roomStatus };
        var guest = new Guest { Name = "João", Document = "111", Contact = "47999999999" };
        db.AddRange(room, guest);
        await db.SaveChangesAsync();

        var reservation = new Reservation
        {
            RoomId = room.RoomId,
            GuestId = guest.GuestId,
            ScheduledCheckIn = DateTime.UtcNow,
            ScheduledCheckOut = DateTime.UtcNow.AddDays(2),
            ActualCheckIn = actualCheckIn
        };
        db.Reservations.Add(reservation);
        await db.SaveChangesAsync();

        return (room, reservation);
    }

    [Fact]
    public async Task CheckIn_DeveMarcarQuartoComoOcupado()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();
        var (room, reservation) = await Seed(db);
        var service = new ReservationService(db);

        // Act
        var found = await service.CheckInAsync(reservation.ReservationId);

        // Assert
        Assert.True(found);
        Assert.Equal(RoomStatus.Occupied, (await db.Rooms.FindAsync(room.RoomId))!.Status);
        Assert.NotNull((await db.Reservations.FindAsync(reservation.ReservationId))!.ActualCheckIn);
    }

    [Fact]
    public async Task CheckOut_DeveMarcarQuartoComoLimpezaPendente()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();
        var (room, reservation) = await Seed(db, RoomStatus.Occupied, DateTime.UtcNow.AddDays(-1));
        var service = new ReservationService(db);

        // Act
        var found = await service.CheckOutAsync(reservation.ReservationId);

        // Assert
        Assert.True(found);
        Assert.Equal(RoomStatus.PendingCleaning, (await db.Rooms.FindAsync(room.RoomId))!.Status);
        Assert.NotNull((await db.Reservations.FindAsync(reservation.ReservationId))!.ActualCheckOut);
    }

    [Theory]
    [InlineData(RoomStatus.Occupied)]
    [InlineData(RoomStatus.PendingCleaning)]
    public async Task CheckIn_ComQuartoNaoLiberado_DeveLancarConflitoSemAlterarNada(RoomStatus roomStatus)
    {
        // Arrange
        var dbName = Guid.NewGuid().ToString();
        using var db = TestDbContextFactory.Create(dbName);
        var (room, reservation) = await Seed(db, roomStatus);
        var service = new ReservationService(db);

        // Act + Assert
        await Assert.ThrowsAsync<ConflictException>(() => service.CheckInAsync(reservation.ReservationId));

        using var verifyDb = TestDbContextFactory.Create(dbName);
        Assert.Equal(roomStatus, (await verifyDb.Rooms.FindAsync(room.RoomId))!.Status);
        Assert.Null((await verifyDb.Reservations.FindAsync(reservation.ReservationId))!.ActualCheckIn);
    }

    [Fact]
    public async Task CheckOut_SemCheckIn_NaoDeveAlterarStatusDoQuarto()
    {
        // Arrange
        var dbName = Guid.NewGuid().ToString();
        using var db = TestDbContextFactory.Create(dbName);
        var (room, reservation) = await Seed(db);
        var service = new ReservationService(db);

        // Act + Assert
        await Assert.ThrowsAsync<InvalidReservationStateException>(
            () => service.CheckOutAsync(reservation.ReservationId));

        using var verifyDb = TestDbContextFactory.Create(dbName);
        Assert.Equal(RoomStatus.Available, (await verifyDb.Rooms.FindAsync(room.RoomId))!.Status);
    }

    [Fact]
    public async Task FluxoCompleto_DeveLiberarQuartoAposLimpeza()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();
        var (room, reservation) = await Seed(db);
        var reservations = new ReservationService(db);
        var rooms = new RoomService(db);

        // Act
        await reservations.CheckInAsync(reservation.ReservationId);
        await reservations.CheckOutAsync(reservation.ReservationId);
        var found = await rooms.FinishCleaningAsync(room.RoomId);

        // Assert
        Assert.True(found);
        Assert.Equal(RoomStatus.Available, (await db.Rooms.FindAsync(room.RoomId))!.Status);
    }

    [Theory]
    [InlineData(RoomStatus.Available)]
    [InlineData(RoomStatus.Occupied)]
    public async Task FinishCleaning_QuandoQuartoNaoAguardaLimpeza_DeveLancarConflito(RoomStatus roomStatus)
    {
        // Arrange
        using var db = TestDbContextFactory.Create();
        var (room, _) = await Seed(db, roomStatus);
        var service = new RoomService(db);

        // Act + Assert
        await Assert.ThrowsAsync<ConflictException>(() => service.FinishCleaningAsync(room.RoomId));
        Assert.Equal(roomStatus, (await db.Rooms.FindAsync(room.RoomId))!.Status);
    }

    [Fact]
    public async Task FinishCleaning_QuandoQuartoNaoExiste_DeveRetornarFalse()
    {
        using var db = TestDbContextFactory.Create();

        Assert.False(await new RoomService(db).FinishCleaningAsync(999));
    }
}
