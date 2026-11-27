using StayEase.Api.Exceptions;
using StayEase.Api.Models;

namespace StayEase.Tests.Models;

public class ReservationStateTransitionTests
{
    private static Reservation Confirmed() => new();

    private static Reservation CheckedIn() => new() { ActualCheckIn = DateTime.UtcNow.AddHours(-2) };

    private static Reservation CheckedOut() => new()
    {
        ActualCheckIn = DateTime.UtcNow.AddDays(-2),
        ActualCheckOut = DateTime.UtcNow.AddHours(-1)
    };

    private static Reservation Cancelled() => new() { IsCancelled = true };

    [Fact]
    public void Status_DeveRefletirOEstadoDaReserva()
    {
        Assert.Equal(ReservationStatus.Confirmed, Confirmed().Status);
        Assert.Equal(ReservationStatus.CheckedIn, CheckedIn().Status);
        Assert.Equal(ReservationStatus.CheckedOut, CheckedOut().Status);
        Assert.Equal(ReservationStatus.Cancelled, Cancelled().Status);
    }

    [Fact]
    public void CheckIn_Duplicado_DeveLancarExcecaoSemAlterarData()
    {
        // Arrange
        var reservation = CheckedIn();
        var originalCheckIn = reservation.ActualCheckIn;

        // Act + Assert
        Assert.Throws<InvalidReservationStateException>(() => reservation.CheckIn());
        Assert.Equal(originalCheckIn, reservation.ActualCheckIn);
    }

    [Fact]
    public void CheckIn_DeReservaCancelada_DeveLancarExcecao()
    {
        var reservation = Cancelled();

        Assert.Throws<InvalidReservationStateException>(() => reservation.CheckIn());
        Assert.Null(reservation.ActualCheckIn);
    }

    [Fact]
    public void CheckIn_DeReservaFinalizada_DeveLancarExcecao()
    {
        Assert.Throws<InvalidReservationStateException>(() => CheckedOut().CheckIn());
    }

    [Fact]
    public void CheckOut_SemCheckIn_DeveLancarExcecao()
    {
        var reservation = Confirmed();

        Assert.Throws<InvalidReservationStateException>(() => reservation.CheckOut());
        Assert.Null(reservation.ActualCheckOut);
    }

    [Fact]
    public void CheckOut_Duplicado_DeveLancarExcecaoSemAlterarData()
    {
        // Arrange
        var reservation = CheckedOut();
        var originalCheckOut = reservation.ActualCheckOut;

        // Act + Assert
        Assert.Throws<InvalidReservationStateException>(() => reservation.CheckOut());
        Assert.Equal(originalCheckOut, reservation.ActualCheckOut);
    }

    [Fact]
    public void CheckOut_DeReservaCancelada_DeveLancarExcecao()
    {
        var reservation = new Reservation { IsCancelled = true, ActualCheckIn = DateTime.UtcNow };

        Assert.Throws<InvalidReservationStateException>(() => reservation.CheckOut());
    }

    [Fact]
    public void Cancel_DeReservaFinalizada_DeveLancarExcecao()
    {
        var reservation = CheckedOut();

        Assert.Throws<InvalidReservationStateException>(() => reservation.Cancel());
        Assert.False(reservation.IsCancelled);
    }

    [Fact]
    public void Cancel_ComHospedeHospedado_DeveLancarExcecao()
    {
        var reservation = CheckedIn();

        Assert.Throws<InvalidReservationStateException>(() => reservation.Cancel());
        Assert.False(reservation.IsCancelled);
    }

    [Fact]
    public void FluxoCompleto_ConfirmadaHospedadaFinalizada_DevePermitirTransicoes()
    {
        var reservation = Confirmed();

        reservation.CheckIn();
        Assert.Equal(ReservationStatus.CheckedIn, reservation.Status);

        reservation.CheckOut();
        Assert.Equal(ReservationStatus.CheckedOut, reservation.Status);
    }
}
