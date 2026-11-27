using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using StayEase.Api.Models;

namespace StayEase.Api.Auth;

/// <summary>
/// Development-only bypass enabled by Auth:Disabled=true: every request is treated as an
/// administrator, so the system can be used without logging in. Program.cs refuses to start
/// with this setting outside the Development environment.
/// </summary>
public class NoLoginAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string SchemeName = "NoLogin";

    public NoLoginAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder)
    {
    }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var identity = new ClaimsIdentity(
        [
            new Claim(JwtRegisteredClaimNames.Sub, "0"),
            new Claim(JwtRegisteredClaimNames.Email, "sem-login@stayease.local"),
            new Claim(TokenService.RoleClaim, UserRole.Administrator.ToString())
        ], SchemeName, JwtRegisteredClaimNames.Email, TokenService.RoleClaim);

        var ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), SchemeName);
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
