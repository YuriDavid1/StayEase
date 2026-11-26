using System.Text.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using StayEase.Api.Exceptions;
using StayEase.Api.Middlewares;

namespace StayEase.Tests.Middlewares;

public class GlobalExceptionHandlerTests
{
    private sealed class TeapotException : AppException
    {
        public TeapotException(string message) : base(message)
        {
        }

        public override int StatusCode => StatusCodes.Status418ImATeapot;
        public override string Title => "Teapot";
    }

    private static (GlobalExceptionHandler handler, DefaultHttpContext context) CreateHandler()
    {
        var services = new ServiceCollection()
            .AddLogging()
            .AddProblemDetails()
            .BuildServiceProvider();

        var context = new DefaultHttpContext { RequestServices = services };
        context.Response.Body = new MemoryStream();

        var handler = new GlobalExceptionHandler(
            services.GetRequiredService<IProblemDetailsService>(),
            NullLogger<GlobalExceptionHandler>.Instance);

        return (handler, context);
    }

    private static async Task<JsonElement> ReadBody(HttpContext context)
    {
        context.Response.Body.Position = 0;
        return await JsonSerializer.DeserializeAsync<JsonElement>(context.Response.Body);
    }

    [Fact]
    public async Task ExcecaoInesperada_DeveRetornar500SemExporDetalhesInternos()
    {
        // Arrange
        var (handler, context) = CreateHandler();
        var exception = new InvalidOperationException("Npgsql: password authentication failed for user postgres");

        // Act
        var handled = await handler.TryHandleAsync(context, exception, CancellationToken.None);

        // Assert
        Assert.True(handled);
        Assert.Equal(500, context.Response.StatusCode);

        var body = await ReadBody(context);
        var raw = body.GetRawText();

        Assert.Equal(500, body.GetProperty("status").GetInt32());
        Assert.DoesNotContain("Npgsql", raw);
        Assert.DoesNotContain("password", raw);
    }

    [Fact]
    public async Task AppException_DeveUsarStatusEMensagemDaExcecao()
    {
        // Arrange
        var (handler, context) = CreateHandler();

        // Act
        var handled = await handler.TryHandleAsync(context, new TeapotException("Short and stout"), CancellationToken.None);

        // Assert
        Assert.True(handled);
        Assert.Equal(418, context.Response.StatusCode);

        var body = await ReadBody(context);

        Assert.Equal("Teapot", body.GetProperty("title").GetString());
        Assert.Equal("Short and stout", body.GetProperty("detail").GetString());
    }
}
