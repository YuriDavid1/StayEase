using StayEase.Api.Models;

namespace StayEase.Api.Auth;

/// <summary>
/// Role names used in [Authorize(Roles = ...)]. They match the UserRole enum names,
/// which is what the token's "role" claim contains.
/// </summary>
public static class Roles
{
    public const string Administrator = nameof(UserRole.Administrator);
    public const string Receptionist = nameof(UserRole.Receptionist);
    public const string Housekeeping = nameof(UserRole.Housekeeping);
    public const string Guest = nameof(UserRole.Guest);

    /// <summary>Manages guests and reservations.</summary>
    public const string FrontDesk = Administrator + "," + Receptionist;

    /// <summary>Releases rooms after cleaning.</summary>
    public const string Cleaning = Administrator + "," + Housekeeping;

    /// <summary>
    /// Front desk plus the guest self-service pages.
    /// TODO(M07): once users are linked to guests, restrict Guest to their own data.
    /// </summary>
    public const string FrontDeskAndGuest = FrontDesk + "," + Guest;
}
