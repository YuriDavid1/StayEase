namespace StayEase.Api.Exceptions;

/// <summary>
/// An operation is not allowed for the current state of a reservation
/// (e.g. check-in of a cancelled reservation).
/// </summary>
public class InvalidReservationStateException : ConflictException
{
    public InvalidReservationStateException(string message) : base(message)
    {
    }
}
