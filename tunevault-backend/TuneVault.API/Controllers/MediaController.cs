using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using TuneVault.Application.Common;
using TuneVault.Application.DTOs.Artist;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Features.Artist.Queries.SearchArtists;
using TuneVault.Application.Features.Media.Commands.DeleteMedia;
using TuneVault.Application.Features.Media.Commands.MultiMediaUpload;
using TuneVault.Application.Features.Media.Commands.PlayMedia;
using TuneVault.Application.Features.Media.Commands.UpdateMedia;
using TuneVault.Application.Features.Media.Commands.UploadMedia;
using TuneVault.Application.Interfaces;
using System.Security.Claims;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/media")]
public class MediaController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IMediaService _mediaService;

    public MediaController(IMediator mediator, IMediaService mediaService)
    {
        _mediator = mediator;
        _mediaService = mediaService;
    }

    [HttpPost("upload")]
    [Authorize]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(200 * 1024 * 1024)]
    public async Task<IActionResult> Upload([FromForm] UploadMediaRequest request)
    {
        if (request.File == null || request.File.Length == 0)
            return BadRequest(ApiResponse<object>.ErrorResponse("File không hợp lệ"));

        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        using var stream = request.File.OpenReadStream();

        var command = new UploadMediaCommand(
            UserId: userId,
            Request: new MediaUploadRequestDto
            {
                Title = Path.GetFileNameWithoutExtension(request.File.FileName),
                MediaType = request.File.ContentType.StartsWith("video", StringComparison.OrdinalIgnoreCase) ? "Video" : "Audio",
                ArtistId = request.ArtistId
            },
            FileStream: stream,
            FileName: request.File.FileName,
            ContentType: request.File.ContentType
        );

        var result = await _mediator.Send(command);
        return Ok(ApiResponse<MediaUploadResultDto>.SuccessResponse(result, "Upload thành công"));
    }

    [HttpGet("stream/{id:long}")]
    public async Task<IActionResult> Stream(long id)
    {
        try
        {
            var media = await _mediaService.GetMediaByIdAsync(id);
            if (media == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Không tìm thấy media"));

            var stream = await _mediaService.GetMediaStreamAsync(id);
            var contentType = media.MediaType == "Video" ? "video/mp4" : "audio/mpeg";

            return File(stream, contentType, enableRangeProcessing: true);
        }
        catch (FileNotFoundException)
        {
            return NotFound(ApiResponse<object>.ErrorResponse("Không tìm thấy file media"));
        }
    }

    [HttpGet("{id:long}")]
    public async Task<IActionResult> GetById(long id)
    {
        var media = await _mediaService.GetMediaByIdAsync(id);
        if (media == null)
            return NotFound(ApiResponse<object>.ErrorResponse("Không tìm thấy media"));

        return Ok(ApiResponse<MediaItemDto>.SuccessResponse(media));
    }

    [HttpGet("{id:long}/detail")]
    public async Task<IActionResult> GetDetail(long id)
    {
        var media = await _mediaService.GetMediaByIdAsync(id);
        if (media == null)
            return NotFound(ApiResponse<object>.ErrorResponse("Không tìm thấy media"));

        return Ok(ApiResponse<MediaItemDto>.SuccessResponse(media));
    }

    [HttpGet("my-uploads")]
    [Authorize]
    public async Task<IActionResult> GetMyUploads([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var result = await _mediaService.GetUserMediaAsync(userId, page, pageSize);
        return Ok(ApiResponse<List<MediaItemDto>>.SuccessResponse(result));
    }

    [HttpPut("{id:long}")]
    [Authorize]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(20 * 1024 * 1024)]
    public async Task<IActionResult> UpdateMedia(long id, [FromForm] UpdateMediaRequestDto request)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var success = await _mediator.Send(new UpdateMediaCommand(userId, id, request));
        if (!success)
            return NotFound(ApiResponse<object>.ErrorResponse("Không tìm thấy media hoặc bạn không có quyền sửa"));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Cập nhật thành công"));
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchMedia(
        [FromQuery] string keyword,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        if (string.IsNullOrWhiteSpace(keyword))
            return BadRequest(ApiResponse<object>.ErrorResponse("Vui lòng nhập từ khóa tìm kiếm"));

        var result = await _mediaService.SearchMediaAsync(keyword, page, pageSize);
        return Ok(ApiResponse<List<MediaSearchResultDto>>.SuccessResponse(result));
    }

    [HttpGet("trending")]
    public async Task<IActionResult> GetTrending([FromQuery] int limit = 12)
    {
        var result = await _mediaService.GetTrendingMediaAsync(limit);
        return Ok(ApiResponse<List<MediaItemDto>>.SuccessResponse(result));
    }

    [HttpGet("new-releases")]
    public async Task<IActionResult> GetNewReleases([FromQuery] int limit = 12)
    {
        var result = await _mediaService.GetNewReleasesAsync(limit);
        return Ok(ApiResponse<List<MediaItemDto>>.SuccessResponse(result));
    }


    [HttpPost("durations/recalculate")]
    [Authorize]
    public async Task<IActionResult> RecalculateMissingDurations()
    {
        var updatedCount = await _mediaService.RecalculateMissingDurationsAsync();

        return Ok(ApiResponse<int>.SuccessResponse(
            updatedCount,
            $"Đã cập nhật thời lượng cho {updatedCount} media"
        ));
    }

    [HttpPost("{id:long}/play")]
    [Authorize]
    public async Task<IActionResult> PlayMedia(long id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var success = await _mediator.Send(new PlayMediaCommand(userId, id));
        if (!success)
            return NotFound(ApiResponse<object>.ErrorResponse("Không tìm thấy media"));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Đã ghi nhận lượt phát"));
    }

    [HttpDelete("{id:long}")]
    [Authorize]
    public async Task<IActionResult> DeleteMedia(long id)
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var success = await _mediator.Send(new DeleteMediaCommand(userId, id));
        if (!success)
            return NotFound(ApiResponse<object>.ErrorResponse("Không tìm thấy media hoặc bạn không có quyền xóa"));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Xóa media thành công"));
    }

    [HttpGet("artists/search")]
    public async Task<IActionResult> SearchArtists([FromQuery] string keyword, [FromQuery] int limit = 10)
    {
        var result = await _mediator.Send(new SearchArtistsQuery(keyword, limit));
        return Ok(ApiResponse<List<ArtistDto>>.SuccessResponse(result));
    }

    [HttpPost("upload-multi")]
    [Authorize]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(250 * 1024 * 1024)]
    public async Task<IActionResult> UploadMulti([FromForm] MultiMediaUploadRequestDto request)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                     ?? User.FindFirstValue("sub")
                     ?? User.FindFirstValue("nameid");

        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        if (string.IsNullOrWhiteSpace(request.Title))
            return BadRequest(ApiResponse<object>.ErrorResponse("Vui lòng nhập tên media"));

        if (request.AudioFile == null && request.VideoFile == null)
            return BadRequest(ApiResponse<object>.ErrorResponse("Vui lòng chọn ít nhất 1 file Audio hoặc Video"));

        if (request.AudioFile is { Length: > 0 } &&
            !request.AudioFile.ContentType.StartsWith("audio/", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("File audio không hợp lệ"));
        }

        if (request.VideoFile is { Length: > 0 } &&
            !request.VideoFile.ContentType.StartsWith("video/", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("File video không hợp lệ"));
        }

        if (request.ThumbnailFile is { Length: > 0 } &&
            !request.ThumbnailFile.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(ApiResponse<object>.ErrorResponse("Thumbnail chỉ được chọn file ảnh"));
        }

        var command = new MultiMediaUploadCommand(
            UserId: userId,
            Request: request,
            AudioStream: request.AudioFile?.OpenReadStream(),
            AudioFileName: request.AudioFile?.FileName,
            VideoStream: request.VideoFile?.OpenReadStream(),
            VideoFileName: request.VideoFile?.FileName,
            ThumbnailStream: request.ThumbnailFile?.OpenReadStream(),
            ThumbnailFileName: request.ThumbnailFile?.FileName
        );

        var result = await _mediator.Send(command);

        return Ok(ApiResponse<MultiMediaUploadResultDto>.SuccessResponse(result, "Upload media thành công"));
    }
}

public class UploadMediaRequest
{
    public IFormFile File { get; set; } = null!;
    public int? ArtistId { get; set; }
}
