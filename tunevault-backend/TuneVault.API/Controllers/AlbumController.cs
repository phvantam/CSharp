using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Common;
using TuneVault.Application.DTOs.Album;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Interfaces;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/albums")]
public class AlbumController : ControllerBase
{
    private readonly IAlbumService _albumService;

    public AlbumController(IAlbumService albumService)
    {
        _albumService = albumService;
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetAlbum(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var album = await _albumService.GetAlbumDetailAsync(id, userId, isAdmin);

        if (album == null)
            return NotFound(ApiResponse<object>.ErrorResponse("Không tìm thấy album"));

        return Ok(ApiResponse<AlbumDetailDto>.SuccessResponse(album));
    }

    [HttpGet("{id:int}/tracks")]
    public async Task<IActionResult> GetAlbumTracks(int id)
    {
        var tracks = await _albumService.GetAlbumTracksAsync(id);
        return Ok(ApiResponse<List<MediaItemDto>>.SuccessResponse(tracks));
    }

    [Authorize]
    [HttpPost]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreateAlbum([FromForm] CreateAlbumRequestDto request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var album = await _albumService.CreateAlbumAsync(userId, isAdmin, request);
            return Ok(ApiResponse<AlbumDetailDto>.SuccessResponse(album, "Tạo album thành công"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
        }
    }

    [Authorize]
    [HttpPut("{id:int}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UpdateAlbum(int id, [FromForm] UpdateAlbumRequestDto request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var album = await _albumService.UpdateAlbumAsync(id, userId, isAdmin, request);

            if (album == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Không tìm thấy album"));

            return Ok(ApiResponse<AlbumDetailDto>.SuccessResponse(album, "Cập nhật album thành công"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
    }

    [Authorize]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteAlbum(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var deleted = await _albumService.DeleteAlbumAsync(id, userId, isAdmin);

            if (!deleted)
                return NotFound(ApiResponse<object>.ErrorResponse("Không tìm thấy album"));

            return Ok(ApiResponse<bool>.SuccessResponse(true, "Xóa album thành công"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.ErrorResponse(ex.Message));
        }
    }

    [Authorize]
    [HttpPost("{id:int}/tracks/{mediaItemId:long}")]
    public async Task<IActionResult> AddTrackToAlbum(int id, long mediaItemId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var success = await _albumService.AddTrackToAlbumAsync(id, mediaItemId, userId, isAdmin);
            return Ok(ApiResponse<bool>.SuccessResponse(success, "Đã thêm bài hát vào album"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
        }
    }

    [Authorize]
    [HttpDelete("{id:int}/tracks/{mediaItemId:long}")]
    public async Task<IActionResult> RemoveTrackFromAlbum(int id, long mediaItemId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var success = await _albumService.RemoveTrackFromAlbumAsync(id, mediaItemId, userId, isAdmin);
            return Ok(ApiResponse<bool>.SuccessResponse(success, "Đã xóa bài hát khỏi album"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
        }
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("User không hợp lệ.");
    }
}
