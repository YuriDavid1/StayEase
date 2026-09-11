using Microsoft.AspNetCore.Mvc;
using StayEase.Api.Controllers;
using StayEase.Api.Dtos;
using StayEase.Api.Models;

namespace StayEase.Tests.Controllers;

public class GuestsControllerTests
{
    [Fact]
    public async Task GetGuests_DeveRetornarTodosOsHospedes()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        db.Guests.AddRange(
            new Guest
            {
                Name = "João Silva",
                Document = "123456789",
                Contact = "47999999999"
            },
            new Guest
            {
                Name = "Maria Silva",
                Document = "987654321",
                Contact = "47888888888"
            }
        );

        await db.SaveChangesAsync();

        var controller = new GuestsController(db);

        // Act
        var result = await controller.GetGuests();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var guests = Assert.IsAssignableFrom<IEnumerable<Guest>>(okResult.Value);

        Assert.Equal(2, guests.Count());
    }

    [Fact]
    public async Task GetGuests_QuandoNaoExistemHospedes_DeveRetornarListaVazia()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new GuestsController(db);

        // Act
        var result = await controller.GetGuests();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var guests = Assert.IsAssignableFrom<IEnumerable<Guest>>(okResult.Value);

        Assert.Empty(guests);
    }

    [Fact]
    public async Task AddGuest_ComDadosValidos_DeveCriarHospede()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new GuestsController(db);

        var dto = new CreateGuestDto(
            "João Silva",
            "123456789",
            "47999999999"
        );

        // Act
        var result = await controller.AddGuest(dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var guest = Assert.IsType<Guest>(okResult.Value);

        Assert.Equal("João Silva", guest.Name);
        Assert.Equal("123456789", guest.Document);
        Assert.Equal("47999999999", guest.Contact);

        Assert.Single(db.Guests);
    }

    [Fact]
    public async Task AddGuest_DeveGerarIdParaNovoHospede()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new GuestsController(db);

        var dto = new CreateGuestDto(
            "Carlos Souza",
            "111222333",
            "47991112222"
        );

        // Act
        var result = await controller.AddGuest(dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var guest = Assert.IsType<Guest>(okResult.Value);

        Assert.True(guest.GuestId > 0);
    }

    [Fact]
    public async Task AddGuest_DevePersistirTodosOsDados()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new GuestsController(db);

        var dto = new CreateGuestDto(
            "Ana Souza",
            "555666777",
            "47998887777"
        );

        // Act
        await controller.AddGuest(dto);

        // Assert
        var guest = db.Guests.Single();

        Assert.Equal("Ana Souza", guest.Name);
        Assert.Equal("555666777", guest.Document);
        Assert.Equal("47998887777", guest.Contact);
    }

    [Fact]
    public async Task UpdateGuest_QuandoHospedeExiste_DeveAtualizarDados()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var guest = new Guest
        {
            Name = "João Silva",
            Document = "123456789",
            Contact = "47999999999"
        };

        db.Guests.Add(guest);
        await db.SaveChangesAsync();

        var controller = new GuestsController(db);

        var dto = new UpdateGuestDto(
            "João Santos",
            "987654321",
            "47888888888"
        );

        // Act
        var result = await controller.UpdateGuest(guest.GuestId, dto);

        // Assert
        Assert.IsType<NoContentResult>(result);

        var updatedGuest = await db.Guests.FindAsync(guest.GuestId);

        Assert.NotNull(updatedGuest);
        Assert.Equal("João Santos", updatedGuest.Name);
        Assert.Equal("987654321", updatedGuest.Document);
        Assert.Equal("47888888888", updatedGuest.Contact);
    }

    [Fact]
    public async Task UpdateGuest_QuandoHospedeNaoExiste_DeveRetornarNotFound()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new GuestsController(db);

        var dto = new UpdateGuestDto(
            "João Santos",
            "987654321",
            "47888888888"
        );

        // Act
        var result = await controller.UpdateGuest(999, dto);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);

        Assert.Equal(404, notFoundResult.StatusCode);
    }

    [Fact]
    public async Task UpdateGuest_DevePreservarIdDoHospede()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var guest = new Guest
        {
            Name = "Nome Original",
            Document = "123456",
            Contact = "47999999999"
        };

        db.Guests.Add(guest);
        await db.SaveChangesAsync();

        var originalId = guest.GuestId;

        var controller = new GuestsController(db);

        var dto = new UpdateGuestDto(
            "Novo Nome",
            "654321",
            "47888888888"
        );

        // Act
        await controller.UpdateGuest(originalId, dto);

        // Assert
        var updatedGuest = await db.Guests.FindAsync(originalId);

        Assert.NotNull(updatedGuest);
        Assert.Equal(originalId, updatedGuest.GuestId);
        Assert.Equal("Novo Nome", updatedGuest.Name);
    }

    [Fact]
    public async Task DeleteGuest_QuandoHospedeExiste_DeveRemoverHospede()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var guest = new Guest
        {
            Name = "João Silva",
            Document = "123456789",
            Contact = "47999999999"
        };

        db.Guests.Add(guest);
        await db.SaveChangesAsync();

        var controller = new GuestsController(db);

        // Act
        var result = await controller.DeleteGuest(guest.GuestId);

        // Assert
        Assert.IsType<NoContentResult>(result);
        Assert.Empty(db.Guests);
    }

    [Fact]
    public async Task DeleteGuest_QuandoHospedeNaoExiste_DeveRetornarNotFound()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new GuestsController(db);

        // Act
        var result = await controller.DeleteGuest(999);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);

        Assert.Equal(404, notFoundResult.StatusCode);
    }

    [Fact]
    public async Task DeleteGuest_DeveRemoverSomenteOHospedeInformado()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var guest1 = new Guest
        {
            Name = "João",
            Document = "111",
            Contact = "47999999999"
        };

        var guest2 = new Guest
        {
            Name = "Maria",
            Document = "222",
            Contact = "47888888888"
        };

        db.Guests.AddRange(guest1, guest2);
        await db.SaveChangesAsync();

        var controller = new GuestsController(db);

        // Act
        await controller.DeleteGuest(guest1.GuestId);

        // Assert
        Assert.Null(await db.Guests.FindAsync(guest1.GuestId));
        Assert.NotNull(await db.Guests.FindAsync(guest2.GuestId));
        Assert.Single(db.Guests);
    }
}