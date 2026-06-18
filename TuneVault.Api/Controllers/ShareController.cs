using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TuneVault.Application.Features.Share.Commands;
using TuneVault.Application.Features.Share.Queries;
using TuneVault.Api.Common; // Đã cập nhật namespace đúng vị trí file ApiResponse

namespace TuneVault.Api.Controllers;

[Authorize]
[Produces("application/json")]
public class ShareController : BaseApiController
{
    private readonly IMediator _mediator;

    public ShareController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("Không tìm thấy thông tin định danh người dùng.");

    /// <summary>
    /// Chia sẻ một bài hát (MediaItem) hoặc một danh sách phát (Playlist) cho người dùng khác
    /// </summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Share([FromBody] ShareRequest request)
    {
        try
        {
            var result = await _mediator.Send(new ShareMediaCommand(
                CurrentUserId,
                request.ReceiverUserId,
                request.MediaItemId,
                request.PlaylistId,
                request.Message
            ));
            return OkResponse(result);
        }
        catch (Exception ex)
        {
            return BadResponse(ex.Message);
        }
    }

    /// <summary>
    /// Lấy danh sách nội dung được người khác chia sẻ với tôi
    /// </summary>
    [HttpGet("with-me")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<object>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetSharedWithMe()
    {
        try
        {
            var result = await _mediator.Send(new GetSharedWithMeQuery(CurrentUserId));
            return OkResponse(result);
        }
        catch (Exception ex)
        {
            return BadResponse(ex.Message);
        }
    }

    /// <summary>
    /// Lấy danh sách nội dung do chính tôi chia sẻ cho người khác
    /// </summary>
    [HttpGet("by-me")]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<object>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetSharedByMe()
    {
        try
        {
            var result = await _mediator.Send(new GetSharedByMeQuery(CurrentUserId));
            return OkResponse(result);
        }
        catch (Exception ex)
        {
            return BadResponse(ex.Message);
        }
    }
}

// Request body model
public record ShareRequest(string ReceiverUserId, Guid? MediaItemId, Guid? PlaylistId, string? Message);