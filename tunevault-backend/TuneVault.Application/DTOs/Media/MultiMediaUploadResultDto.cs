namespace TuneVault.Application.DTOs.Media;

public class MultiMediaUploadResultDto
{
    public long? AudioMediaItemId { get; set; }
    public long? VideoMediaItemId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? ThumbnailUrl { get; set; }
}