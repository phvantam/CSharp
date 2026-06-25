using System.Security.Claims;
using TuneVault.Application.Common;

namespace TuneVault.Api.Middleware;

public sealed class JwtAuthenticationMiddleware
{
    private readonly RequestDelegate _next;

    public JwtAuthenticationMiddleware(RequestDelegate next) => _next = next;

    public async Task InvokeAsync(HttpContext context, ITokenService tokenService)
    {
        var auth = context.Request.Headers["Authorization"].ToString();
        if (!string.IsNullOrWhiteSpace(auth) && auth.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            var token = auth["Bearer ".Length..];
            if (tokenService.ValidateToken(token))
            {
                var userId = tokenService.GetUserId(token);
                if (!string.IsNullOrWhiteSpace(userId))
                {
                    var identity = new ClaimsIdentity(new[]
                    {
                        new Claim("sub", userId)
                    }, "Bearer");
                    context.User = new ClaimsPrincipal(identity);
                }
            }
        }

        await _next(context);
    }
}
