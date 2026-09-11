using Microsoft.AspNetCore.Mvc;
using StayEase.Api.Controllers;
using StayEase.Api.Dtos;
using StayEase.Api.Models;

namespace StayEase.Tests.Controllers;

public class ReservationsControllerTests
{
    [Fact]
    public async Task GetActiveReservations_DeveRetornarSomenteReservasAtivas()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var activeReservation = new Reservation
        {
            RoomId = 1,
            GuestId = 1,
            ScheduledCheckIn = DateTime.UtcNow,
            ScheduledCheckOut = DateTime.UtcNow.AddDays(2),
            IsCancelled = false,
            ActualCheckOut = null
        };

        var cancelledReservation = new Reservation
        {
            RoomId = 2,
            GuestId = 2,
            ScheduledCheckIn = DateTime.UtcNow,
            ScheduledCheckOut = DateTime.UtcNow.AddDays(2),
            IsCancelled = true,
            ActualCheckOut = null
        };

        var completedReservation = new Reservation
        {
            RoomId = 3,
            GuestId = 3,
            ScheduledCheckIn = DateTime.UtcNow.AddDays(-2),
            ScheduledCheckOut = DateTime.UtcNow,
            IsCancelled = false,
            ActualCheckOut = DateTime.UtcNow
        };

        db.Reservations.AddRange(
            activeReservation,
            cancelledReservation,
            completedReservation
        );

        await db.SaveChangesAsync();

        var controller = new ReservationsController(db);

        // Act
        var result = await controller.GetActiveReservations();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);

        var reservations =
            Assert.IsAssignableFrom<IEnumerable<Reservation>>(okResult.Value);

        Assert.Single(reservations);

        Assert.Equal(
            activeReservation.ReservationId,
            reservations.First().ReservationId
        );
    }

    [Fact]
    public async Task GetActiveReservations_QuandoNaoExistemReservas_DeveRetornarListaVazia()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new ReservationsController(db);

        // Act
        var result = await controller.GetActiveReservations();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);

        var reservations =
            Assert.IsAssignableFrom<IEnumerable<Reservation>>(okResult.Value);

        Assert.Empty(reservations);
    }

    [Fact]
    public async Task GetAllReservations_DeveRetornarTodasAsReservas()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        db.Reservations.AddRange(
            new Reservation
            {
                RoomId = 1,
                GuestId = 1,
                ScheduledCheckIn = DateTime.UtcNow,
                ScheduledCheckOut = DateTime.UtcNow.AddDays(2)
            },
            new Reservation
            {
                RoomId = 2,
                GuestId = 2,
                ScheduledCheckIn = DateTime.UtcNow,
                ScheduledCheckOut = DateTime.UtcNow.AddDays(3),
                IsCancelled = true
            }
        );

        await db.SaveChangesAsync();

        var controller = new ReservationsController(db);

        // Act
        var result = await controller.GetAllReservations();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);

        var reservations =
            Assert.IsAssignableFrom<IEnumerable<Reservation>>(okResult.Value);

        Assert.Equal(2, reservations.Count());
    }

    [Fact]
    public async Task CreateReservation_ComDadosValidos_DeveCriarReserva()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new ReservationsController(db);

        var checkIn = DateTime.UtcNow;
        var checkOut = checkIn.AddDays(2);

        var dto = new CreateReservationDto(
            1,
            1,
            checkIn,
            checkOut
        );

        // Act
        var result = await controller.CreateReservation(dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var reservation = Assert.IsType<Reservation>(okResult.Value);

        Assert.Equal(1, reservation.RoomId);
        Assert.Equal(1, reservation.GuestId);
        Assert.Equal(checkIn, reservation.ScheduledCheckIn);
        Assert.Equal(checkOut, reservation.ScheduledCheckOut);

        Assert.Single(db.Reservations);
    }

    [Fact]
    public async Task CreateReservation_DeveGerarIdParaNovaReserva()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new ReservationsController(db);

        var dto = new CreateReservationDto(
            1,
            1,
            DateTime.UtcNow,
            DateTime.UtcNow.AddDays(2)
        );

        // Act
        var result = await controller.CreateReservation(dto);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        var reservation = Assert.IsType<Reservation>(okResult.Value);

        Assert.True(reservation.ReservationId > 0);
    }

    [Fact]
    public async Task GetReservation_QuandoReservaExiste_DeveRetornarReserva()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var reservation = new Reservation
        {
            RoomId = 1,
            GuestId = 1,
            ScheduledCheckIn = DateTime.UtcNow,
            ScheduledCheckOut = DateTime.UtcNow.AddDays(2)
        };

        db.Reservations.Add(reservation);
        await db.SaveChangesAsync();

        var controller = new ReservationsController(db);

        // Act
        var result =
            await controller.GetReservation(reservation.ReservationId);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);

        var returnedReservation =
            Assert.IsType<Reservation>(okResult.Value);

        Assert.Equal(
            reservation.ReservationId,
            returnedReservation.ReservationId
        );
    }

    [Fact]
    public async Task GetReservation_QuandoReservaNaoExiste_DeveRetornarNotFound()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new ReservationsController(db);

        // Act
        var result = await controller.GetReservation(999);

        // Assert
        var notFoundResult =
            Assert.IsType<NotFoundObjectResult>(result);

        Assert.Equal(404, notFoundResult.StatusCode);
    }

    [Fact]
    public async Task GetReservationsByGuest_DeveRetornarSomenteReservasDoHospede()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var reservation1 = new Reservation
        {
            RoomId = 1,
            GuestId = 10,
            ScheduledCheckIn = DateTime.UtcNow,
            ScheduledCheckOut = DateTime.UtcNow.AddDays(2)
        };

        var reservation2 = new Reservation
        {
            RoomId = 2,
            GuestId = 20,
            ScheduledCheckIn = DateTime.UtcNow,
            ScheduledCheckOut = DateTime.UtcNow.AddDays(2)
        };

        var reservation3 = new Reservation
        {
            RoomId = 3,
            GuestId = 10,
            ScheduledCheckIn = DateTime.UtcNow,
            ScheduledCheckOut = DateTime.UtcNow.AddDays(3)
        };

        db.Reservations.AddRange(
            reservation1,
            reservation2,
            reservation3
        );

        await db.SaveChangesAsync();

        var controller = new ReservationsController(db);

        // Act
        var result =
            await controller.GetReservationsByGuest(10);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);

        var reservations =
            Assert.IsAssignableFrom<IEnumerable<Reservation>>(okResult.Value);

        Assert.Equal(2, reservations.Count());

        Assert.All(
            reservations,
            reservation => Assert.Equal(10, reservation.GuestId)
        );
    }

    [Fact]
    public async Task GetReservationsByGuest_QuandoNaoExistemReservas_DeveRetornarListaVazia()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new ReservationsController(db);

        // Act
        var result =
            await controller.GetReservationsByGuest(999);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);

        var reservations =
            Assert.IsAssignableFrom<IEnumerable<Reservation>>(okResult.Value);

        Assert.Empty(reservations);
    }

    [Fact]
    public async Task GetReservationsByRoom_DeveRetornarSomenteReservasDoQuarto()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var reservation1 = new Reservation
        {
            RoomId = 1,
            GuestId = 10,
            ScheduledCheckIn = DateTime.UtcNow,
            ScheduledCheckOut = DateTime.UtcNow.AddDays(2)
        };

        var reservation2 = new Reservation
        {
            RoomId = 2,
            GuestId = 20,
            ScheduledCheckIn = DateTime.UtcNow,
            ScheduledCheckOut = DateTime.UtcNow.AddDays(2)
        };

        var reservation3 = new Reservation
        {
            RoomId = 1,
            GuestId = 30,
            ScheduledCheckIn = DateTime.UtcNow,
            ScheduledCheckOut = DateTime.UtcNow.AddDays(3)
        };

        db.Reservations.AddRange(
            reservation1,
            reservation2,
            reservation3
        );

        await db.SaveChangesAsync();

        var controller = new ReservationsController(db);

        // Act
        var result =
            await controller.GetReservationsByRoom(1);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);

        var reservations =
            Assert.IsAssignableFrom<IEnumerable<Reservation>>(okResult.Value);

        Assert.Equal(2, reservations.Count());

        Assert.All(
            reservations,
            reservation => Assert.Equal(1, reservation.RoomId)
        );
    }

    [Fact]
    public async Task GetReservationsByRoom_QuandoNaoExistemReservas_DeveRetornarListaVazia()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new ReservationsController(db);

        // Act
        var result =
            await controller.GetReservationsByRoom(999);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);

        var reservations =
            Assert.IsAssignableFrom<IEnumerable<Reservation>>(okResult.Value);

        Assert.Empty(reservations);
    }

    [Fact]
    public async Task CheckIn_QuandoReservaExiste_DeveRegistrarEntrada()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var reservation = new Reservation
        {
            RoomId = 1,
            GuestId = 1,
            ScheduledCheckIn = DateTime.UtcNow,
            ScheduledCheckOut = DateTime.UtcNow.AddDays(2)
        };

        db.Reservations.Add(reservation);
        await db.SaveChangesAsync();

        var controller = new ReservationsController(db);

        // Act
        var result =
            await controller.CheckIn(reservation.ReservationId);

        // Assert
        Assert.IsType<NoContentResult>(result);

        var updatedReservation =
            await db.Reservations.FindAsync(reservation.ReservationId);

        Assert.NotNull(updatedReservation);
        Assert.NotNull(updatedReservation.ActualCheckIn);
    }

    [Fact]
    public async Task CheckIn_QuandoReservaNaoExiste_DeveRetornarNotFound()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new ReservationsController(db);

        // Act
        var result = await controller.CheckIn(999);

        // Assert
        var notFoundResult =
            Assert.IsType<NotFoundObjectResult>(result);

        Assert.Equal(404, notFoundResult.StatusCode);
    }

    [Fact]
    public async Task CheckOut_QuandoReservaExiste_DeveRegistrarSaida()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var reservation = new Reservation
        {
            RoomId = 1,
            GuestId = 1,
            ScheduledCheckIn = DateTime.UtcNow,
            ScheduledCheckOut = DateTime.UtcNow.AddDays(2)
        };

        db.Reservations.Add(reservation);
        await db.SaveChangesAsync();

        var controller = new ReservationsController(db);

        // Act
        var result =
            await controller.CheckOut(reservation.ReservationId);

        // Assert
        Assert.IsType<NoContentResult>(result);

        var updatedReservation =
            await db.Reservations.FindAsync(reservation.ReservationId);

        Assert.NotNull(updatedReservation);
        Assert.NotNull(updatedReservation.ActualCheckOut);
    }

    [Fact]
    public async Task CheckOut_QuandoReservaNaoExiste_DeveRetornarNotFound()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new ReservationsController(db);

        // Act
        var result = await controller.CheckOut(999);

        // Assert
        var notFoundResult =
            Assert.IsType<NotFoundObjectResult>(result);

        Assert.Equal(404, notFoundResult.StatusCode);
    }

    [Fact]
    public async Task Cancel_QuandoReservaExiste_DeveCancelarReserva()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var reservation = new Reservation
        {
            RoomId = 1,
            GuestId = 1,
            ScheduledCheckIn = DateTime.UtcNow,
            ScheduledCheckOut = DateTime.UtcNow.AddDays(2)
        };

        db.Reservations.Add(reservation);
        await db.SaveChangesAsync();

        var controller = new ReservationsController(db);

        // Act
        var result =
            await controller.Cancel(reservation.ReservationId);

        // Assert
        Assert.IsType<NoContentResult>(result);

        var updatedReservation =
            await db.Reservations.FindAsync(reservation.ReservationId);

        Assert.NotNull(updatedReservation);
        Assert.True(updatedReservation.IsCancelled);
    }

    [Fact]
    public async Task Cancel_QuandoReservaNaoExiste_DeveRetornarNotFound()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var controller = new ReservationsController(db);

        // Act
        var result = await controller.Cancel(999);

        // Assert
        var notFoundResult =
            Assert.IsType<NotFoundObjectResult>(result);

        Assert.Equal(404, notFoundResult.StatusCode);
    }

    [Fact]
    public async Task Reserva_DevePermitirFluxoDeCheckInECheckOut()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var reservation = new Reservation
        {
            RoomId = 1,
            GuestId = 1,
            ScheduledCheckIn = DateTime.UtcNow,
            ScheduledCheckOut = DateTime.UtcNow.AddDays(2)
        };

        db.Reservations.Add(reservation);
        await db.SaveChangesAsync();

        var controller = new ReservationsController(db);

        // Act
        var checkInResult =
            await controller.CheckIn(reservation.ReservationId);

        var checkOutResult =
            await controller.CheckOut(reservation.ReservationId);

        // Assert
        Assert.IsType<NoContentResult>(checkInResult);
        Assert.IsType<NoContentResult>(checkOutResult);

        var updatedReservation =
            await db.Reservations.FindAsync(reservation.ReservationId);

        Assert.NotNull(updatedReservation);
        Assert.NotNull(updatedReservation.ActualCheckIn);
        Assert.NotNull(updatedReservation.ActualCheckOut);
    }

    [Fact]
    public async Task ReservaCancelada_NaoDeveAparecerNasReservasAtivas()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var reservation = new Reservation
        {
            RoomId = 1,
            GuestId = 1,
            ScheduledCheckIn = DateTime.UtcNow,
            ScheduledCheckOut = DateTime.UtcNow.AddDays(2)
        };

        db.Reservations.Add(reservation);
        await db.SaveChangesAsync();

        var controller = new ReservationsController(db);

        // Act
        await controller.Cancel(reservation.ReservationId);

        var result =
            await controller.GetActiveReservations();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);

        var reservations =
            Assert.IsAssignableFrom<IEnumerable<Reservation>>(okResult.Value);

        Assert.Empty(reservations);
    }

    [Fact]
    public async Task ReservaComCheckOut_NaoDeveAparecerNasReservasAtivas()
    {
        // Arrange
        using var db = TestDbContextFactory.Create();

        var reservation = new Reservation
        {
            RoomId = 1,
            GuestId = 1,
            ScheduledCheckIn = DateTime.UtcNow,
            ScheduledCheckOut = DateTime.UtcNow.AddDays(2)
        };

        db.Reservations.Add(reservation);
        await db.SaveChangesAsync();

        var controller = new ReservationsController(db);

        // Act
        await controller.CheckOut(reservation.ReservationId);

        var result =
            await controller.GetActiveReservations();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);

        var reservations =
            Assert.IsAssignableFrom<IEnumerable<Reservation>>(okResult.Value);

        Assert.Empty(reservations);
    }
}