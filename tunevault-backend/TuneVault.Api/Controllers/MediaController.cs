using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Api.Common;
using TuneVault.Api.DTOs;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class MediaController : BaseApiController
{
    private readonly IMediaRepository _mediaRepository;
    private readonly IWebHostEnvironment _env;

    public MediaController(IMediaRepository mediaRepository, IWebHostEnvironment env)
    {
        _mediaRepository = mediaRepository;
        _env = env;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetAll()
    {
        var mediaItems = await _mediaRepository.GetAllAsync();
        return OkResponse(mediaItems);
    }

    [HttpPost("upload")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> Upload([FromForm] MediaUploadRequest request)
    {
        var file = request.File;
        if (file == null || file.Length == 0)
            return BadResponse("File không hợp lệ hoặc trống.");

        var allowedExtensions = new[] { ".mp3", ".wav", ".mp4", ".mov", ".m4a", ".flac" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
            return BadResponse("Định dạng file không được hỗ trợ.");

        // Bổ sung xử lý an toàn cho WebRootPath để tránh lỗi ArgumentNullException
        var rootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var uploadsFolder = Path.Combine(rootPath, "uploads");

        if (!Directory.Exists(uploadsFolder)) 
            Directory.CreateDirectory(uploadsFolder);

        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        var mediaItem = new MediaItem
        {
            Id = Guid.NewGuid(),
            Title = file.FileName,
            Url = $"uploads/{fileName}", // Lưu đường dẫn tương đối
            MediaType = file.ContentType,
            Duration = 0,
            CreatedAt = DateTime.UtcNow
        };
        
        await _mediaRepository.AddAsync(mediaItem);
        return OkResponse(mediaItem);
    }

    [HttpGet("stream/{id:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> Stream([FromRoute] Guid id)
    {
        var media = await _mediaRepository.GetByIdAsync(id);
        if (media == null) return NotFoundResponse("Không tìm thấy tệp tin trong cơ sở dữ liệu.");

        // Sử dụng logic lấy path an toàn tương tự
        var rootPath = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        var path = Path.Combine(rootPath, media.Url);

        if (!System.IO.File.Exists(path))
            return NotFoundResponse($"Tệp tin vật lý không tồn tại tại: {path}");

        return PhysicalFile(path, media.MediaType, enableRangeProcessing: true);
    }
}