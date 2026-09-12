using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StayEase.Api.Models;

public class Guest
{
    public Guest()
    {

    }

    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int GuestId { get; set; }

    [StringLength(100)]
    public string Name { get; set; } = string.Empty;

    [StringLength(50)]
    public string Document { get; set; } = string.Empty;

    [StringLength(50)]
    public string Contact { get; set; } = string.Empty;
}
