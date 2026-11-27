namespace StayEase.Api.Exceptions;

/// <summary>
/// Base class for expected application errors. The message is safe to be shown to the client
/// and is translated into a ProblemDetails response by the GlobalExceptionHandler.
/// </summary>
public abstract class AppException : Exception
{
    protected AppException(string message) : base(message)
    {
    }

    public abstract int StatusCode { get; }

    public abstract string Title { get; }
}
