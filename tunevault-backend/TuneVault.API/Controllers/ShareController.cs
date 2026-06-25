using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using TuneVault.Application.Common;
using TuneVault.Application.DTOs.Share;
using TuneVault.Application.Features.Share.Commands.ShareMedia;
using TuneVault.Application.Features.Share.Queries.GetReceivedShares;
using TuneVault.Application.Features.Share.Queries.GetSentShares;
using TuneVault.Application.Features.Share.Commands.SharePlaylist;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/share")]
[Authorize]
public class ShareController : ControllerBase
{
    private readonly IMediator _mediator;

    public ShareController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost]
    public async Task<IActionResult> Share([FromBody] ShareMediaRequestDto request)
    {
        var senderUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(senderUserId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var result = await _mediator.Send(new ShareMediaCommand(senderUserId, request));

        var contentName = result.ShareType == "Playlist" ? "playlist" : "bài hát";
        var message = result.IsDuplicate
            ? $"{contentName} này đã được chia sẻ cho người này rồi"
            : $"Chia sẻ {contentName} thành công";

        return Ok(ApiResponse<ShareResponseDto>.SuccessResponse(result, message));
    }

    [HttpGet("received")]
    public async Task<IActionResult> GetReceived()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var result = await _mediator.Send(new GetReceivedSharesQuery(userId));
        return Ok(ApiResponse<List<ShareInboxDto>>.SuccessResponse(result));
    }

    [HttpGet("sent")]
    public async Task<IActionResult> GetSent()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var result = await _mediator.Send(new GetSentSharesQuery(userId));
        return Ok(ApiResponse<List<ShareInboxDto>>.SuccessResponse(result));
    }

    [HttpPost("playlist")]
    public async Task<IActionResult> SharePlaylist([FromBody] SharePlaylistRequestDto request)
    {
        var senderId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(senderId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var result = await _mediator.Send(new SharePlaylistCommand(
            senderId,
            request.PlaylistId,
            request.ReceiverUserId,
            request.Message
        ));

        var message = result.IsDuplicate
            ? "Playlist này đã được chia sẻ cho người này rồi"
            : "Chia sẻ playlist thành công";

        return Ok(ApiResponse<ShareResponseDto>.SuccessResponse(result, message));
    }
}
