namespace TuneVault.Application.DTOs.Media;

public class MediaUploadResultDto
{
    public long MediaItemId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string MediaType { get; set; } = string.Empty;
    public string FilePath { get; set; } = string.Empty;
}