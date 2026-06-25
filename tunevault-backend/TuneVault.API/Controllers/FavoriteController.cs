using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using TuneVault.Application.Common;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Features.Favorite.Commands.AddToFavorite;
using TuneVault.Application.Features.Favorite.Commands.RemoveFromFavorite;
using TuneVault.Application.Features.Favorite.Queries.GetMyFavorites;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/favorite")]
[Authorize]
public class FavoriteController : ControllerBase
{
    private readonly IMediator _mediator;

    public FavoriteController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("{mediaItemId:long}")]
    public async Task<IActionResult> AddToFavorite(long mediaItemId)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var success = await _mediator.Send(new AddToFavoriteCommand(userId, mediaItemId));
        if (!success)
            return BadRequest(ApiResponse<object>.ErrorResponse("Không tìm thấy bài hát để thêm vào yêu thích"));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Đã thêm vào yêu thích"));
    }

    [HttpDelete("{mediaItemId:long}")]
    public async Task<IActionResult> RemoveFromFavorite(long mediaItemId)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var success = await _mediator.Send(new RemoveFromFavoriteCommand(userId, mediaItemId));
        if (!success)
            return NotFound(ApiResponse<object>.ErrorResponse("Bài hát chưa có trong danh sách yêu thích"));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Đã xóa khỏi yêu thích"));
    }

    [HttpGet]
    public async Task<IActionResult> GetMyFavorites()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var result = await _mediator.Send(new GetMyFavoritesQuery(userId));
        return Ok(ApiResponse<List<MediaItemDto>>.SuccessResponse(result));
    }
}