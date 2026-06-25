using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using TuneVault.Application.Features.Follows;
using TuneVault.Infrastructure.SignalR;

namespace TuneVault.Api.Controllers;

[ApiController]
[Route("api/follows")]
public class FollowController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IHubContext<NotificationHub> _hubContext;

    public FollowController(IMediator mediator, IHubContext<NotificationHub> hubContext)
    {
        _mediator = mediator;
        _hubContext = hubContext;
    }

    [HttpPost("{targetUserId}")]
    public async Task<IActionResult> Follow(string targetUserId)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new FollowUserCommand(userId, targetUserId));
        if (result.Success)
            await _hubContext.Clients.User(targetUserId).SendAsync("ReceiveNotification", new { type = "NewFollower", actorUserId = userId });
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{targetUserId}")]
    public async Task<IActionResult> Unfollow(string targetUserId)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new UnfollowUserCommand(userId, targetUserId));
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpGet("followers")]
    public async Task<IActionResult> GetFollowers()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new GetFollowersQuery(userId));
        return Ok(result);
    }

    [HttpGet("following")]
    public async Task<IActionResult> GetFollowing()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new GetFollowingQuery(userId));
        return Ok(result);
    }
}
