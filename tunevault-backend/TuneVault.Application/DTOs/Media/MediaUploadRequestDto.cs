namespace TuneVault.Application.DTOs.Media;

public class MediaUploadRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }

    public int? ArtistId { get; set; }           
    public string? Artist { get; set; }       

    public string? Album { get; set; }
    public string? Genre { get; set; }
    public string MediaType { get; set; } = "Audio";
    
    public string? ThumbnailUrl { get; set; }
}