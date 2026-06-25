using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Common;
using TuneVault.Application.DTOs.Album;
using TuneVault.Application.DTOs.Artist;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Interfaces;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/artists")]
public class ArtistController : ControllerBase
{
    private readonly IArtistService _artistService;

    public ArtistController(IArtistService artistService)
    {
        _artistService = artistService;
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetArtist(int id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isAdmin = User.IsInRole("Admin");

        var artist = await _artistService.GetArtistDetailAsync(id, userId, isAdmin);

        if (artist == null)
            return NotFound(ApiResponse<object>.ErrorResponse("Không tìm thấy nghệ sĩ"));

        return Ok(ApiResponse<ArtistDetailDto>.SuccessResponse(artist));
    }

    [HttpGet("{id:int}/songs")]
    public async Task<IActionResult> GetArtistSongs(int id, [FromQuery] int limit = 50)
    {
        var songs = await _artistService.GetArtistSongsAsync(id, limit);
        return Ok(ApiResponse<List<MediaItemDto>>.SuccessResponse(songs));
    }

    [HttpGet("{id:int}/albums")]
    public async Task<IActionResult> GetArtistAlbums(int id)
    {
        var albums = await _artistService.GetArtistAlbumsAsync(id);
        return Ok(ApiResponse<List<AlbumDto>>.SuccessResponse(albums));
    }

    [Authorize]
    [HttpPut("{id:int}")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UpdateArtist(int id, [FromForm] UpdateArtistRequestDto request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");

            var artist = await _artistService.UpdateArtistAsync(id, userId, isAdmin, request);

            if (artist == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Không tìm thấy nghệ sĩ"));

            return Ok(ApiResponse<ArtistDetailDto>.SuccessResponse(artist, "Cập nhật nghệ sĩ thành công"));
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
    [HttpGet("{id:int}/managers")]
    public async Task<IActionResult> GetArtistManagers(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");
            var managers = await _artistService.GetArtistManagersAsync(id, userId, isAdmin);
            return Ok(ApiResponse<List<ArtistManagerDto>>.SuccessResponse(managers));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.ErrorResponse(ex.Message));
        }
    }

    [Authorize]
    [HttpPost("{id:int}/managers")]
    public async Task<IActionResult> AddArtistManager(int id, [FromBody] AddArtistManagerRequestDto request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");
            var manager = await _artistService.AddArtistManagerAsync(id, userId, isAdmin, request);
            return Ok(ApiResponse<ArtistManagerDto>.SuccessResponse(manager, "Đã thêm người quản lý nghệ sĩ"));
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
    [HttpPut("{id:int}/managers/{targetUserId}/role")]
    public async Task<IActionResult> UpdateArtistManagerRole(
        int id,
        string targetUserId,
        [FromBody] UpdateArtistManagerRoleRequestDto request)
    {
        try
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");
            var manager = await _artistService.UpdateArtistManagerRoleAsync(id, targetUserId, userId, isAdmin, request);
            return Ok(ApiResponse<ArtistManagerDto>.SuccessResponse(manager, "Đã cập nhật quyền quản lý"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
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
    [HttpDelete("{id:int}/managers/{targetUserId}")]
    public async Task<IActionResult> RemoveArtistManager(int id, string targetUserId)
    {
        try
        {
            var userId = GetCurrentUserId();
            var isAdmin = User.IsInRole("Admin");
            var removed = await _artistService.RemoveArtistManagerAsync(id, targetUserId, userId, isAdmin);

            if (!removed)
                return NotFound(ApiResponse<object>.ErrorResponse("Không tìm thấy người quản lý này"));

            return Ok(ApiResponse<object>.SuccessResponse(null!, "Đã xóa người quản lý nghệ sĩ"));
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, ApiResponse<object>.ErrorResponse(ex.Message));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ApiResponse<object>.ErrorResponse(ex.Message));
        }
    }

    [Authorize]
    [HttpPost("{id:int}/follow")]
    public async Task<IActionResult> FollowArtist(int id)
    {
        try
        {
            var userId = GetCurrentUserId();
            var success = await _artistService.FollowArtistAsync(id, userId);
            return Ok(ApiResponse<bool>.SuccessResponse(success, "Đã quan tâm nghệ sĩ"));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(ApiResponse<object>.ErrorResponse(ex.Message));
        }
    }

    [Authorize]
    [HttpDelete("{id:int}/follow")]
    public async Task<IActionResult> UnfollowArtist(int id)
    {
        var userId = GetCurrentUserId();
        var success = await _artistService.UnfollowArtistAsync(id, userId);
        return Ok(ApiResponse<bool>.SuccessResponse(success, "Đã bỏ quan tâm nghệ sĩ"));
    }

    private string GetCurrentUserId()
    {
        return User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new UnauthorizedAccessException("User không hợp lệ.");
    }
}
