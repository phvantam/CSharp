using MediatR;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Common;
using TuneVault.Application.Features.MediaLibrary;
using TuneVault.Domain.Interfaces;

namespace TuneVault.Api.Controllers;

[ApiController]
[Route("api/media")]
public class MediaController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IFileStorageService _fileStorageService;
    private readonly IAlbumRepository _albumRepository;

    public MediaController(IMediator mediator, IFileStorageService fileStorageService, IAlbumRepository albumRepository)
    {
        _mediator = mediator;
        _fileStorageService = fileStorageService;
        _albumRepository = albumRepository;
    }

    [HttpPost("upload")]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> Upload()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        if (!Request.HasFormContentType) return BadRequest(ApiResponse.Fail("Form content required"));
        var form = await Request.ReadFormAsync();
        var file = form.Files.GetFile("video") ?? form.Files.GetFile("file");
        if (file is null || file.Length == 0) return BadRequest(ApiResponse.Fail("Audio/Video file is required"));

        var title = form["title"].ToString();
        if (string.IsNullOrWhiteSpace(title)) title = Path.GetFileNameWithoutExtension(file.FileName);

        var artist = form["artist"].ToString();
        var albumIdStr = form["albumId"].ToString();

        int? albumId = null;
        string? albumTitle = null;
        if (int.TryParse(albumIdStr, out var parsedAlbumId))
        {
            var album = await _albumRepository.GetByIdAsync(parsedAlbumId);
            if (album is null) return BadRequest(ApiResponse.Fail("Selected album not found"));
            if (album.OwnerUserId != userId) return StatusCode(403, ApiResponse.Fail("Only the album creator can add music to this album"));
            albumId = parsedAlbumId;
            albumTitle = album.Title;
        }

        var extension = Path.GetExtension(file.FileName);
        var filePath = await _fileStorageService.SaveFileAsync(file.OpenReadStream(), file.FileName);

        string? thumbnailUrl = null;
        var thumbnailFile = form.Files.GetFile("thumbnail");
        if (thumbnailFile is not null && thumbnailFile.Length > 0)
        {
            var thumbPath = await _fileStorageService.SaveFileAsync(thumbnailFile.OpenReadStream(), thumbnailFile.FileName);
            thumbnailUrl = $"/uploads/{Path.GetFileName(thumbPath)}";
        }

        var mediaType = extension.ToLowerInvariant() switch
        {
            ".mp4" or ".mov" or ".avi" or ".mkv" or ".webm" => "Video",
            _ => "Audio"
        };

        var result = await _mediator.Send(new UploadMediaCommand(title, userId, filePath, extension, artist, albumId, albumTitle, thumbnailUrl, mediaType));
        return result.Success ? Created($"/api/media/{((dynamic)result.Data!).MediaItemId}", result) : BadRequest(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetMedia(long id)
    {
        var query = await _mediator.Send(new GetMediaByIdQuery(id));
        if (!query.Success) return NotFound();
        var media = (TuneVault.Domain.Entities.MediaItem)query.Data!;
        var contentType = media.MediaType == "Video" ? "video/mp4" : "audio/mpeg";
        if (media.FilePath?.EndsWith(".wav", StringComparison.OrdinalIgnoreCase) == true) contentType = "audio/wav";
        return PhysicalFile(Path.GetFullPath(media.FilePath ?? ""), contentType, enableRangeProcessing: true);
    }

    [HttpGet("{id}/stream")]
    public async Task<IActionResult> StreamMedia(long id)
    {
        var query = await _mediator.Send(new GetMediaByIdQuery(id));
        if (!query.Success) return NotFound();
        var media = (TuneVault.Domain.Entities.MediaItem)query.Data!;
        var contentType = media.MediaType == "Video" ? "video/mp4" : "audio/mpeg";
        if (media.FilePath?.EndsWith(".wav", StringComparison.OrdinalIgnoreCase) == true) contentType = "audio/wav";
        return PhysicalFile(Path.GetFullPath(media.FilePath ?? ""), contentType, enableRangeProcessing: true);
    }

    [HttpGet("trending")]
    public async Task<IActionResult> GetTrending()
    {
        var result = await _mediator.Send(new GetTrendingMediaQuery());
        return Ok(result);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchMedia([FromQuery] string? q)
    {
        var result = await _mediator.Send(new Application.Features.Search.SearchMediaQuery(q ?? ""));
        return Ok(result);
    }

    [HttpPut("{id}")]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> UpdateMedia(long id)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        if (!Request.HasFormContentType) return BadRequest(ApiResponse.Fail("Form content required"));
        var form = await Request.ReadFormAsync();
        var title = form["title"].ToString();
        var artist = form["artist"].ToString();
        var albumIdStr = form["albumId"].ToString();

        int? albumId = null;
        string? albumTitle = null;
        if (int.TryParse(albumIdStr, out var parsedAlbumId))
        {
            var album = await _albumRepository.GetByIdAsync(parsedAlbumId);
            if (album is null) return BadRequest(ApiResponse.Fail("Selected album not found"));
            if (album.OwnerUserId != userId) return StatusCode(403, ApiResponse.Fail("Only the album creator can add music to this album"));
            albumId = parsedAlbumId;
            albumTitle = album.Title;
        }

        string? thumbnailUrl = null;
        var thumbnailFile = form.Files.GetFile("thumbnail");
        if (thumbnailFile is not null && thumbnailFile.Length > 0)
        {
            var thumbPath = await _fileStorageService.SaveFileAsync(thumbnailFile.OpenReadStream(), thumbnailFile.FileName);
            thumbnailUrl = $"/uploads/{Path.GetFileName(thumbPath)}";
        }

        var result = await _mediator.Send(new UpdateMediaCommand(id, userId, title, artist, albumId, albumTitle, thumbnailUrl));
        return result.Success ? Ok(result) : BadRequest(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteMedia(long id)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new DeleteMediaCommand(id, userId));
        return result.Success ? Ok(result) : NotFound(result);
    }
}
