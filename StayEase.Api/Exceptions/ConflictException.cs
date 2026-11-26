namespace StayEase.Api.Exceptions;

/// <summary>
/// The request is valid but conflicts with the current state of a resource (HTTP 409).
/// </summary>
public class ConflictException : AppException
{
    public ConflictException(string message) : base(message)
    {
    }

    public override int StatusCode => StatusCodes.Status409Conflict;

    public override string Title => "Conflict";
}
