using Microsoft.AspNetCore.Http;

namespace TuneVault.Application.DTOs.Media;

public class UpdateMediaRequest
{
    public string? Title { get; set; }
    public string? Description { get; set; }
    public string? Artist { get; set; }
    public string? Album { get; set; }
    public string? Genre { get; set; }
    public string? Lyrics { get; set; }

    public string? Visibility { get; set; }
    public bool? IsPublic { get; set; }

    public IFormFile? ThumbnailFile { get; set; }
}
