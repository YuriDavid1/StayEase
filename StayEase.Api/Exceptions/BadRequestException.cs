namespace StayEase.Api.Exceptions;

/// <summary>
/// The request data is invalid (HTTP 400), e.g. check-out before check-in.
/// </summary>
public class BadRequestException : AppException
{
    public BadRequestException(string message) : base(message)
    {
    }

    public override int StatusCode => StatusCodes.Status400BadRequest;

    public override string Title => "Invalid request";
}
