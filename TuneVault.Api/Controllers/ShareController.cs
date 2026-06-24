using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using TuneVault.Application.Features.ShareMedia;
using TuneVault.Infrastructure.SignalR;

namespace TuneVault.Api.Controllers;

[ApiController]
[Route("api/shares")]
public class ShareController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IHubContext<NotificationHub> _hubContext;

    public ShareController(IMediator mediator, IHubContext<NotificationHub> hubContext)
    {
        _mediator = mediator;
        _hubContext = hubContext;
    }

    [HttpPost]
    public async Task<IActionResult> Share([FromBody] ShareRequest req)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var result = await _mediator.Send(new ShareMediaCommand(userId, req.ReceiverUserId, req.MediaItemId, req.PlaylistId, req.Message));
        if (!result.Success) return BadRequest(result);

        // Push real-time notification
        await _hubContext.Clients.User(req.ReceiverUserId).SendAsync("ReceiveNotification", result.Data);
        return Created($"/api/shares/{((dynamic)result.Data!).MediaShareId}", result);
    }

    [HttpGet("inbox")]
    public async Task<IActionResult> GetInbox()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new GetShareInboxQuery(userId));
        return Ok(result);
    }

    [HttpGet("sent")]
    public async Task<IActionResult> GetSent()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new GetShareSentQuery(userId));
        return Ok(result);
    }
}

public record ShareRequest(string ReceiverUserId, long? MediaItemId, long? PlaylistId, string? Message);
