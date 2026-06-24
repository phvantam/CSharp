using Microsoft.AspNetCore.Http;
using TuneVault.Application.Common;

namespace TuneVault.Infrastructure.Services;

public sealed class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? UserId => _httpContextAccessor.HttpContext?.User?.FindFirst("sub")?.Value;
    public bool IsAuthenticated => !string.IsNullOrWhiteSpace(UserId);
}
