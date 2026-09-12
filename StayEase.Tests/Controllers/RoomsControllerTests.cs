using Microsoft.AspNetCore.Mvc;
using StayEase.Api.Controllers;
using StayEase.Api.Dtos;
using StayEase.Api.Models;

namespace StayEase.Tests.Controllers;

public class RoomsControllerTests
{
    [Fact]
    public async Task GetRooms_DeveRetornarTodosOsQuartos()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        db.Rooms.AddRange(
            new Room
            {
                Number = "101",
                Type = "Standard",
                Capacity = 2,
                Status = RoomStatus.Available
            },
            new Room
            {
                Number = "202",
                Type = "Deluxe",
                Capacity = 4,
                Status = RoomStatus.Occupied
            }
        );

        await db.SaveChangesAsync();

        var controller = new RoomsController(db);

        // Act
        var result = await controller.GetRooms();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var rooms = Assert.IsAssignableFrom<IEnumerable<Room>>(okResult.Value);

        Assert.Equal(2, rooms.Count());
    }

    [Fact]
    public async Task GetRooms_QuandoNaoExistemQuartos_DeveRetornarListaVazia()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new RoomsController(db);

        // Act
        var result = await controller.GetRooms();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var rooms = Assert.IsAssignableFrom<IEnumerable<Room>>(okResult.Value);

        Assert.Empty(rooms);
    }

    [Fact]
    public async Task AddRoom_ComDadosValidos_DeveCriarQuarto()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new RoomsController(db);

        var dto = new CreateRoomDto(
            "101",
            "Standard",
            2
        );

        // Act
        var result = await controller.AddRoom(dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var room = Assert.IsType<Room>(okResult.Value);

        Assert.Equal("101", room.Number);
        Assert.Equal("Standard", room.Type);
        Assert.Equal(2, room.Capacity);
        Assert.Equal(RoomStatus.Available, room.Status);

        Assert.Single(db.Rooms);
    }

    [Fact]
    public async Task AddRoom_DeveGerarIdParaNovoQuarto()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new RoomsController(db);

        var dto = new CreateRoomDto(
            "301",
            "Luxo",
            3
        );

        // Act
        var result = await controller.AddRoom(dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var room = Assert.IsType<Room>(okResult.Value);

        Assert.True(room.RoomId > 0);
    }

    [Fact]
    public async Task AddRoom_DeveIniciarComoAvailable()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new RoomsController(db);

        var dto = new CreateRoomDto(
            "301",
            "Luxo",
            3
        );

        // Act
        var result = await controller.AddRoom(dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var room = Assert.IsType<Room>(okResult.Value);

        Assert.Equal(RoomStatus.Available, room.Status);
    }

    [Fact]
    public async Task AddRoom_DevePersistirDadosDoQuarto()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new RoomsController(db);

        var dto = new CreateRoomDto(
            "402",
            "Deluxe",
            4
        );

        // Act
        await controller.AddRoom(dto);

        // Assert
        var room = db.Rooms.Single();

        Assert.Equal("402", room.Number);
        Assert.Equal("Deluxe", room.Type);
        Assert.Equal(4, room.Capacity);
        Assert.Equal(RoomStatus.Available, room.Status);
    }

    [Fact]
    public async Task UpdateRoom_QuandoQuartoExiste_DeveAtualizarQuarto()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var room = new Room
        {
            Number = "101",
            Type = "Standard",
            Capacity = 2,
            Status = RoomStatus.Available
        };

        db.Rooms.Add(room);
        await db.SaveChangesAsync();

        var controller = new RoomsController(db);

        var dto = new UpdateRoomDto(
            "101",
            "Deluxe",
            4,
            RoomStatus.Occupied
        );

        // Act
        var result = await controller.UpdateRoom(room.RoomId, dto);

        // Assert
        Assert.IsType<NoContentResult>(result);

        var updatedRoom = await db.Rooms.FindAsync(room.RoomId);

        Assert.NotNull(updatedRoom);
        Assert.Equal("101", updatedRoom.Number);
        Assert.Equal("Deluxe", updatedRoom.Type);
        Assert.Equal(4, updatedRoom.Capacity);
        Assert.Equal(RoomStatus.Occupied, updatedRoom.Status);
    }

    [Fact]
    public async Task UpdateRoom_DeveAlterarTodosOsCampos()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var room = new Room
        {
            Number = "101",
            Type = "Standard",
            Capacity = 2,
            Status = RoomStatus.Available
        };

        db.Rooms.Add(room);
        await db.SaveChangesAsync();

        var controller = new RoomsController(db);

        var dto = new UpdateRoomDto(
            "505",
            "Suite",
            5,
            RoomStatus.PendingCleaning
        );

        // Act
        await controller.UpdateRoom(room.RoomId, dto);

        // Assert
        var updatedRoom = await db.Rooms.FindAsync(room.RoomId);

        Assert.NotNull(updatedRoom);
        Assert.Equal("505", updatedRoom.Number);
        Assert.Equal("Suite", updatedRoom.Type);
        Assert.Equal(5, updatedRoom.Capacity);
        Assert.Equal(RoomStatus.PendingCleaning, updatedRoom.Status);
    }

    [Fact]
    public async Task UpdateRoom_QuandoQuartoNaoExiste_DeveRetornarNotFound()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new RoomsController(db);

        var dto = new UpdateRoomDto(
            "101",
            "Deluxe",
            4,
            RoomStatus.Occupied
        );

        // Act
        var result = await controller.UpdateRoom(999, dto);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task DeleteRoom_QuandoQuartoExiste_DeveRemoverQuarto()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var room = new Room
        {
            Number = "101",
            Type = "Standard",
            Capacity = 2,
            Status = RoomStatus.Available
        };

        db.Rooms.Add(room);
        await db.SaveChangesAsync();

        var controller = new RoomsController(db);

        // Act
        var result = await controller.DeleteRoom(room.RoomId);

        // Assert
        Assert.IsType<NoContentResult>(result);
        Assert.Empty(db.Rooms);
    }

    [Fact]
    public async Task DeleteRoom_QuandoQuartoNaoExiste_DeveRetornarNotFound()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new RoomsController(db);

        // Act
        var result = await controller.DeleteRoom(999);

        // Assert
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task DeleteRoom_DeveRemoverSomenteOQuartoInformado()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var room1 = new Room
        {
            Number = "101",
            Type = "Standard",
            Capacity = 2,
            Status = RoomStatus.Available
        };

        var room2 = new Room
        {
            Number = "102",
            Type = "Standard",
            Capacity = 2,
            Status = RoomStatus.Available
        };

        db.Rooms.AddRange(room1, room2);
        await db.SaveChangesAsync();

        var controller = new RoomsController(db);

        // Act
        await controller.DeleteRoom(room1.RoomId);

        // Assert
        Assert.Null(await db.Rooms.FindAsync(room1.RoomId));
        Assert.NotNull(await db.Rooms.FindAsync(room2.RoomId));
        Assert.Single(db.Rooms);
    }
}