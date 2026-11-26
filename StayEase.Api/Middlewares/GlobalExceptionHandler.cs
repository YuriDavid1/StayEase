using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using StayEase.Api.Exceptions;

namespace StayEase.Api.Middlewares;

/// <summary>
/// Converts any unhandled exception into an RFC 7807 ProblemDetails response.
/// Internal details (exception message, stack trace) are only logged, never returned to the client.
/// </summary>
public class GlobalExceptionHandler : IExceptionHandler
{
    private const string UnexpectedErrorTitle = "An unexpected error occurred.";
    private const string UnexpectedErrorDetail = "The request could not be processed. Please try again later.";

    private readonly IProblemDetailsService _problemDetailsService;
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(IProblemDetailsService problemDetailsService, ILogger<GlobalExceptionHandler> logger)
    {
        _problemDetailsService = problemDetailsService;
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        ProblemDetails problemDetails;

        if (exception is AppException appException)
        {
            _logger.LogWarning("Request {Method} {Path} rejected: {Message}",
                httpContext.Request.Method, httpContext.Request.Path, appException.Message);

            problemDetails = new ProblemDetails
            {
                Status = appException.StatusCode,
                Title = appException.Title,
                Detail = appException.Message
            };
        }
        else
        {
            _logger.LogError(exception, "Unhandled exception on {Method} {Path}",
                httpContext.Request.Method, httpContext.Request.Path);

            problemDetails = new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = UnexpectedErrorTitle,
                Detail = UnexpectedErrorDetail
            };
        }

        httpContext.Response.StatusCode = problemDetails.Status.Value;

        return await _problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            ProblemDetails = problemDetails,
            Exception = exception
        });
    }
}
