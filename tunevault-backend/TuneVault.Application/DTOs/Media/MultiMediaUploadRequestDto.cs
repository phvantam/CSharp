using Microsoft.AspNetCore.Http;

namespace TuneVault.Application.DTOs.Media;

public class MultiMediaUploadRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? VideoTitle { get; set; }
    public string? Genre { get; set; }
    public int? ArtistId { get; set; }
    public string? Artist { get; set; }

    public IFormFile? ThumbnailFile { get; set; }

    public IFormFile? AudioFile { get; set; }
    public IFormFile? VideoFile { get; set; }
}
