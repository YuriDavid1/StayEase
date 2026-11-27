using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

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

    /// <summary>PBKDF2 hash produced by ASP.NET Core's PasswordHasher. Never serialized.</summary>
    [JsonIgnore]
    [StringLength(200)]
    public string? PasswordHash { get; set; }
}

public enum UserRole
{
    Administrator,
    Receptionist,
    Housekeeping,
    Guest
}
