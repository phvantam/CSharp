using MediatR;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Features.Notifications;

namespace TuneVault.Api.Controllers;

[ApiController]
[Route("api/notifications")]
public class NotificationController : ControllerBase
{
    private readonly IMediator _mediator;
    public NotificationController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new GetNotificationsQuery(userId));
        return Ok(result);
    }

    [HttpPatch("{id}/read")]
    public async Task<IActionResult> MarkRead(long id)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new MarkNotificationReadCommand(id, userId));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPatch("read-all")]
    public async Task<IActionResult> MarkAllRead()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new MarkAllNotificationsReadCommand(userId));
        return Ok(result);
    }
}
