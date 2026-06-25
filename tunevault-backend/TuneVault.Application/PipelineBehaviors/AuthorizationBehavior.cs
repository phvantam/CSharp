using MediatR;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;

namespace TuneVault.Application.PipelineBehaviors;

/// <summary>
/// Interface để đánh dấu command/query cần kiểm tra quyền sở hữu
/// </summary>
public interface IAuthorizableRequest
{
    string ResourceOwnerId { get; }
    string ResourceType { get; }
}

/// <summary>
/// Pipeline Behavior kiểm tra quyền sở hữu (Owner)
/// </summary>
public class AuthorizationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IHttpContextAccessor? _httpContextAccessor;

    public AuthorizationBehavior(IHttpContextAccessor? httpContextAccessor = null)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (request is IAuthorizableRequest authorizable)
        {
            var userId = _httpContextAccessor?.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);

            if (string.IsNullOrEmpty(userId))
                throw new UnauthorizedAccessException("Bạn cần đăng nhập.");

            if (authorizable.ResourceOwnerId != userId)
                throw new UnauthorizedAccessException("Bạn không có quyền thực hiện hành động này.");
        }

        return await next();
    }
}