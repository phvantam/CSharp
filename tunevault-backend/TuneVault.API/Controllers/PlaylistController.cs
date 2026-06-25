using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using TuneVault.Application.Common;
using TuneVault.Application.DTOs.Playlist;
using TuneVault.Application.Interfaces;
using TuneVault.Application.Features.Playlist.Commands.CreatePlaylist;
using TuneVault.Application.Features.Playlist.Commands.UpdatePlaylist;
using TuneVault.Application.Features.Playlist.Commands.DeletePlaylist;
using TuneVault.Application.Features.Playlist.Commands.AddTrackToPlaylist;
using TuneVault.Application.Features.Playlist.Commands.RemoveSongFromPlaylist;
using TuneVault.Application.Features.Playlist.Queries.GetPlaylistDetail;
using TuneVault.Application.Features.Playlist.Queries.GetMyPlaylists;
using TuneVault.Application.Features.Playlist.Queries.GetPopularPlaylists;

namespace TuneVault.API.Controllers;

public class CreatePlaylistFormRequest
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsPublic { get; set; } = true;
    public IFormFile? CoverImageFile { get; set; }
}

public class UpdatePlaylistFormRequest
{
    public string? Title { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Visibility { get; set; }
    public bool? IsPublic { get; set; }
    public IFormFile? CoverImageFile { get; set; }
}

[ApiController]
[Route("api/playlist")]
public class PlaylistController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IWebHostEnvironment _env;
    private readonly IPlaylistService _playlistService;

    public PlaylistController(
        IMediator mediator,
        IWebHostEnvironment env,
        IPlaylistService playlistService)
    {
        _mediator = mediator;
        _env = env;
        _playlistService = playlistService;
    }

    // ==================== TẠO PLAYLIST ====================
    [HttpPost]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> CreatePlaylist([FromForm] CreatePlaylistFormRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(ApiResponse<object>.ErrorResponse("Tên playlist không được để trống"));

        string? coverImageUrl = null;

        if (request.CoverImageFile is { Length: > 0 })
        {
            if (!request.CoverImageFile.ContentType.StartsWith("image/"))
                return BadRequest(ApiResponse<object>.ErrorResponse("File ảnh bìa không hợp lệ"));

            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var folder = Path.Combine(webRoot, "media", "image", "playlists");

            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            var ext = Path.GetExtension(request.CoverImageFile.FileName);
            var fileName = $"{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(folder, fileName);

            await using var stream = new FileStream(filePath, FileMode.Create);
            await request.CoverImageFile.CopyToAsync(stream);

            coverImageUrl = $"/media/image/playlists/{fileName}";
        }

        var dto = new CreatePlaylistRequestDto
        {
            Title = request.Title.Trim(),
            Description = request.Description,
            IsPublic = request.IsPublic,
            CoverImageUrl = coverImageUrl
        };

        var playlistId = await _mediator.Send(new CreatePlaylistCommand(userId, dto));
        return Ok(ApiResponse<long>.SuccessResponse(playlistId, "Tạo playlist thành công"));
    }

    // ==================== LẤY CHI TIẾT PLAYLIST ====================
    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetPlaylistDetail(long id)
    {
        var result = await _mediator.Send(new GetPlaylistDetailQuery(id));
        if (result == null)
            return NotFound(ApiResponse<object>.ErrorResponse("Không tìm thấy playlist"));

        return Ok(ApiResponse<PlaylistDetailDto>.SuccessResponse(result));
    }

    // ==================== LẤY PLAYLIST CỦA TÔI ====================
    [HttpGet("my-playlists")]
    [Authorize]
    public async Task<IActionResult> GetMyPlaylists()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        // Dùng service trực tiếp để đảm bảo DTO luôn có CoverImageUrl mới nhất.
        // Tránh trường hợp GetMyPlaylistsQueryHandler cũ chưa map CoverImageUrl.
        var result = await _playlistService.GetUserPlaylistsAsync(userId);
        return Ok(ApiResponse<List<PlaylistSummaryDto>>.SuccessResponse(result));
    }


    // ==================== PLAYLIST CÔNG KHAI CỦA USER ====================
    [HttpGet("user/{userId}/public")]
    public async Task<IActionResult> GetPublicPlaylistsByUser(string userId)
    {
        var result = await _playlistService.GetPublicPlaylistsByUserAsync(userId);
        return Ok(ApiResponse<List<PlaylistSummaryDto>>.SuccessResponse(result));
    }

    // ==================== LẤY PLAYLIST PHỔ BIẾN ====================
    [HttpGet("popular")]
    public async Task<IActionResult> GetPopularPlaylists([FromQuery] int limit = 12)
    {
        var result = await _mediator.Send(new GetPopularPlaylistsQuery(limit));
        return Ok(ApiResponse<List<PlaylistSummaryDto>>.SuccessResponse(result));
    }

    // ==================== THÊM BÀI HÁT VÀO PLAYLIST ====================
    [HttpPost("{playlistId:long}/songs/{mediaItemId:long}")]
    [Authorize]
    public async Task<IActionResult> AddSongToPlaylist(long playlistId, long mediaItemId)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var success = await _mediator.Send(new AddTrackToPlaylistCommand(userId, playlistId, mediaItemId));
        if (!success)
            return BadRequest(ApiResponse<object>.ErrorResponse("Không thể thêm bài hát"));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Đã thêm bài hát vào playlist"));
    }

    // ==================== XÓA BÀI HÁT KHỎI PLAYLIST ====================
    [HttpDelete("{playlistId:long}/songs/{mediaItemId:long}")]
    [Authorize]
    public async Task<IActionResult> RemoveSongFromPlaylist(long playlistId, long mediaItemId)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var success = await _mediator.Send(new RemoveSongFromPlaylistCommand(userId, playlistId, mediaItemId));
        if (!success)
            return NotFound(ApiResponse<object>.ErrorResponse("Không tìm thấy bài hát trong playlist"));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Đã xóa bài hát khỏi playlist"));
    }

    // ==================== CẬP NHẬT PLAYLIST ====================
    [HttpPut("{id:long}")]
    [Authorize]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UpdatePlaylist(long id, [FromForm] UpdatePlaylistFormRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var name = !string.IsNullOrWhiteSpace(request.Title)
            ? request.Title.Trim()
            : request.Name?.Trim();

        if (string.IsNullOrWhiteSpace(name))
            return BadRequest(ApiResponse<object>.ErrorResponse("Tên playlist không được để trống"));

        string? coverImageUrl = null;

        if (request.CoverImageFile is { Length: > 0 })
        {
            if (!request.CoverImageFile.ContentType.StartsWith("image/"))
                return BadRequest(ApiResponse<object>.ErrorResponse("File ảnh bìa không hợp lệ"));

            if (request.CoverImageFile.Length > 5 * 1024 * 1024)
                return BadRequest(ApiResponse<object>.ErrorResponse("Ảnh bìa tối đa 5MB"));

            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var folder = Path.Combine(webRoot, "media", "image", "playlists");

            if (!Directory.Exists(folder))
                Directory.CreateDirectory(folder);

            var ext = Path.GetExtension(request.CoverImageFile.FileName);
            if (string.IsNullOrWhiteSpace(ext))
                ext = ".jpg";

            var fileName = $"{Guid.NewGuid():N}{ext}";
            var filePath = Path.Combine(folder, fileName);

            await using var stream = new FileStream(filePath, FileMode.Create);
            await request.CoverImageFile.CopyToAsync(stream);

            coverImageUrl = $"/media/image/playlists/{fileName}";
        }

        var visibility = !string.IsNullOrWhiteSpace(request.Visibility)
            ? request.Visibility
            : request.IsPublic == true
                ? "Public"
                : request.IsPublic == false
                    ? "Private"
                    : null;

        var dto = new UpdatePlaylistRequestDto
        {
            Name = name,
            Description = request.Description,
            Visibility = visibility,
            CoverImageUrl = coverImageUrl
        };

        var success = await _mediator.Send(new UpdatePlaylistCommand(userId, id, dto));
        if (!success)
            return NotFound(ApiResponse<object>.ErrorResponse("Không tìm thấy playlist hoặc bạn không có quyền sửa"));

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            success = true,
            coverImageUrl
        }, "Cập nhật playlist thành công"));
    }

    // ==================== XÓA PLAYLIST ====================
    [HttpDelete("{id:long}")]
    [Authorize]
    public async Task<IActionResult> DeletePlaylist(long id)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var success = await _mediator.Send(new DeletePlaylistCommand(userId, id));
        if (!success)
            return NotFound(ApiResponse<object>.ErrorResponse("Không tìm thấy playlist hoặc bạn không có quyền xóa"));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Xóa playlist thành công"));
    }
}
