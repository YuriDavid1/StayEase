using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StayEase.Api.Models;

public class Room
{
    public Room()
    {

    }

    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int RoomId { get; set; }

    [StringLength(50)]
    public string Number { get; set; } = string.Empty;

    [StringLength(50)]
    public string Type { get; set; } = string.Empty;

    public int Capacity { get; set; }

    public RoomStatus Status { get; set; }
}

public enum RoomStatus
{
    Available,
    Occupied,
    PendingCleaning
}
