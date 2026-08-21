using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace StayEase.Api.Models;

public class User
{
    public User()
    {
        
    }

    [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int UserId { get; set; }

    [StringLength(100)]
    public string Email { get; set; } = string.Empty;

    public UserRole Role { get; set; }
}

public enum UserRole
{
    Administrator, 
    Receptionist, 
    Housekeeping
}
