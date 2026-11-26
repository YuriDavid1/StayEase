namespace StayEase.Api.Auth;

public class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "StayEase.Api";

    public string Audience { get; set; } = "StayEase.App";

    /// <summary>
    /// HMAC-SHA256 signing key (at least 32 bytes). Never commit it: use
    /// <c>dotnet user-secrets set "Jwt:Key" "..."</c> or the <c>Jwt__Key</c> environment variable.
    /// </summary>
    public string Key { get; set; } = string.Empty;

    public int ExpirationMinutes { get; set; } = 480;
}
