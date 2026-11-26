using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using StayEase.Api.Exceptions;

namespace StayEase.Api.Models;

public class Reservation
{
    public Reservation()
    {

    }

    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int ReservationId { get; set; }

    public int RoomId { get; set; }
    public Room? Room { get; set; }

    public int GuestId { get; set; }
    public Guest? Guest { get; set; }

    public DateTime ScheduledCheckIn { get; set; }
    public DateTime ScheduledCheckOut { get; set; }

    public DateTime? ActualCheckIn { get; set; }
    public DateTime? ActualCheckOut { get; set; }

    public bool IsCancelled { get; set; } = false;

    [NotMapped]
    public ReservationStatus Status =>
        IsCancelled ? ReservationStatus.Cancelled
        : ActualCheckOut != null ? ReservationStatus.CheckedOut
        : ActualCheckIn != null ? ReservationStatus.CheckedIn
        : ReservationStatus.Confirmed;

    // Allowed transitions:
    //   Confirmed --CheckIn--> CheckedIn --CheckOut--> CheckedOut
    //   Confirmed --Cancel---> Cancelled

    public void CheckIn()
    {
        switch (Status)
        {
            case ReservationStatus.Cancelled:
                throw new InvalidReservationStateException("Não é possível fazer check-in de uma reserva cancelada.");
            case ReservationStatus.CheckedIn:
                throw new InvalidReservationStateException("O check-in desta reserva já foi realizado.");
            case ReservationStatus.CheckedOut:
                throw new InvalidReservationStateException("Esta reserva já foi finalizada.");
        }

        ActualCheckIn = DateTime.UtcNow;
    }

    public void CheckOut()
    {
        switch (Status)
        {
            case ReservationStatus.Cancelled:
                throw new InvalidReservationStateException("Não é possível fazer check-out de uma reserva cancelada.");
            case ReservationStatus.Confirmed:
                throw new InvalidReservationStateException("Não é possível fazer check-out antes do check-in.");
            case ReservationStatus.CheckedOut:
                throw new InvalidReservationStateException("O check-out desta reserva já foi realizado.");
        }

        ActualCheckOut = DateTime.UtcNow;
    }

    public void Cancel()
    {
        switch (Status)
        {
            case ReservationStatus.CheckedIn:
                throw new InvalidReservationStateException("O hóspede já fez check-in; finalize a reserva com o check-out.");
            case ReservationStatus.CheckedOut:
                throw new InvalidReservationStateException("Não é possível cancelar uma reserva já finalizada.");
        }

        // Cancelling an already cancelled reservation is idempotent.
        IsCancelled = true;
    }
}

public enum ReservationStatus
{
    Confirmed,
    CheckedIn,
    CheckedOut,
    Cancelled
}
