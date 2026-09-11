using StayEase.Api.Models;

namespace StayEase.Tests.Models;

public class ReservationTests
{
    [Fact]
    public void NovaReserva_DeveIniciarSemCheckIn()
    {
        // Arrange
        var reservation = new Reservation();

        // Act
        var actualCheckIn = reservation.ActualCheckIn;

        // Assert
        Assert.Null(actualCheckIn);
    }

    [Fact]
    public void NovaReserva_DeveIniciarSemCheckOut()
    {
        // Arrange
        var reservation = new Reservation();

        // Act
        var actualCheckOut = reservation.ActualCheckOut;

        // Assert
        Assert.Null(actualCheckOut);
    }

    [Fact]
    public void NovaReserva_DeveIniciarComoNaoCancelada()
    {
        // Arrange
        var reservation = new Reservation();

        // Act
        var isCancelled = reservation.IsCancelled;

        // Assert
        Assert.False(isCancelled);
    }

    [Fact]
    public void CheckIn_DeveRegistrarDataDeEntrada()
    {
        // Arrange
        var reservation = new Reservation();

        // Act
        reservation.CheckIn();

        // Assert
        Assert.NotNull(reservation.ActualCheckIn);
    }

    [Fact]
    public void CheckIn_DeveDefinirDataAtualAproximada()
    {
        // Arrange
        var reservation = new Reservation();

        var before = DateTime.UtcNow;

        // Act
        reservation.CheckIn();

        var after = DateTime.UtcNow;

        // Assert
        Assert.NotNull(reservation.ActualCheckIn);

        Assert.InRange(
            reservation.ActualCheckIn.Value,
            before,
            after
        );
    }

    [Fact]
    public void CheckOut_DeveRegistrarDataDeSaida()
    {
        // Arrange
        var reservation = new Reservation();

        // Act
        reservation.CheckOut();

        // Assert
        Assert.NotNull(reservation.ActualCheckOut);
    }

    [Fact]
    public void CheckOut_DeveDefinirDataAtualAproximada()
    {
        // Arrange
        var reservation = new Reservation();

        var before = DateTime.UtcNow;

        // Act
        reservation.CheckOut();

        var after = DateTime.UtcNow;

        // Assert
        Assert.NotNull(reservation.ActualCheckOut);

        Assert.InRange(
            reservation.ActualCheckOut.Value,
            before,
            after
        );
    }

    [Fact]
    public void Cancel_DeveMarcarReservaComoCancelada()
    {
        // Arrange
        var reservation = new Reservation();

        // Act
        reservation.Cancel();

        // Assert
        Assert.True(reservation.IsCancelled);
    }

    [Fact]
    public void Cancel_DeveContinuarCanceladaQuandoExecutadoNovamente()
    {
        // Arrange
        var reservation = new Reservation();

        // Act
        reservation.Cancel();
        reservation.Cancel();

        // Assert
        Assert.True(reservation.IsCancelled);
    }

    [Fact]
    public void CheckIn_NaoDeveAlterarStatusDeCancelamento()
    {
        // Arrange
        var reservation = new Reservation();

        // Act
        reservation.CheckIn();

        // Assert
        Assert.False(reservation.IsCancelled);
        Assert.NotNull(reservation.ActualCheckIn);
    }

    [Fact]
    public void CheckOut_NaoDeveAlterarStatusDeCancelamento()
    {
        // Arrange
        var reservation = new Reservation();

        // Act
        reservation.CheckOut();

        // Assert
        Assert.False(reservation.IsCancelled);
        Assert.NotNull(reservation.ActualCheckOut);
    }
}