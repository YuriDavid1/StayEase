using StayEase.Api.Dtos;
using StayEase.Api.Models;
using StayEase.Api.Services;

namespace StayEase.Tests.Services;

public class RoomDailyRateTests
{
    [Fact]
    public async Task Create_DevePersistirDiariaNoBanco()
    {
        // Arrange
        var dbName = Guid.NewGuid().ToString();
        using var db = TestDbContextFactory.Create(dbName);

        // Act
        var room = await new RoomService(db).CreateAsync(new CreateRoomDto("101", "Standard", 2, 289.90m));

        // Assert
        using var verifyDb = TestDbContextFactory.Create(dbName);
        Assert.Equal(289.90m, (await verifyDb.Rooms.FindAsync(room.RoomId))!.DailyRate);
    }

    [Fact]
    public async Task Update_DeveAlterarDiariaNoBanco()
    {
        // Arrange
        var dbName = Guid.NewGuid().ToString();
        using var db = TestDbContextFactory.Create(dbName);
        var service = new RoomService(db);
        var room = await service.CreateAsync(new CreateRoomDto("101", "Standard", 2, 200m));

        // Act
        await service.UpdateAsync(room.RoomId,
            new UpdateRoomDto("101", "Standard", 2, RoomStatus.Available, 350.50m));

        // Assert
        using var verifyDb = TestDbContextFactory.Create(dbName);
        Assert.Equal(350.50m, (await verifyDb.Rooms.FindAsync(room.RoomId))!.DailyRate);
    }

    [Fact]
    public async Task GetAll_DeveRetornarADiariaDeCadaQuarto()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();
        db.Rooms.AddRange(
            new Room { Number = "101", Type = "Standard", Capacity = 2, DailyRate = 150m },
            new Room { Number = "201", Type = "Luxo", Capacity = 3, DailyRate = 420m });
        await db.SaveChangesAsync();

        // Act
        var rooms = await new RoomService(db).GetAllAsync();

        // Assert
        Assert.Equal(new[] { 150m, 420m }, rooms.OrderBy(r => r.Number).Select(r => r.DailyRate));
    }
}
