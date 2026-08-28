using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

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

    //[NotMapped]
    //public string RoomNumber => Room?.Number ?? string.Empty;

    //[NotMapped]
    //public string GuestName => Guest?.Name ?? string.Empty;

    public void CheckIn()
    {
        ActualCheckIn = DateTime.UtcNow;
    }

    public void CheckOut()
    {
        ActualCheckOut = DateTime.UtcNow;
    }

    public void Cancel()
    {
        IsCancelled = true;
    }
}
