using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using TuneVault.Application.Common;
using TuneVault.Application.DTOs.Notification;
using TuneVault.Application.Features.Notification.Queries.GetMyNotifications;
using TuneVault.Application.Features.Notification.Commands.MarkAsRead;
using TuneVault.Application.Features.Notification.Commands.MarkAllAsRead;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/notification")]
[Authorize]
public class NotificationController : ControllerBase
{
    private readonly IMediator _mediator;

    public NotificationController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyNotifications()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var result = await _mediator.Send(new GetMyNotificationsQuery(userId));
        return Ok(ApiResponse<List<NotificationDto>>.SuccessResponse(result));
    }

    [HttpPut("{id:long}/read")]
    public async Task<IActionResult> MarkAsRead(long id)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var success = await _mediator.Send(new MarkAsReadCommand(userId, id));
        return Ok(ApiResponse<bool>.SuccessResponse(success, "Đã đánh dấu đã đọc"));
    }

    [HttpPut("read-all")]
    public async Task<IActionResult> MarkAllAsRead()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        await _mediator.Send(new MarkAllAsReadCommand(userId));
        return Ok(ApiResponse<bool>.SuccessResponse(true, "Đã đánh dấu tất cả đã đọc"));
    }
}