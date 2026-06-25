namespace TuneVault.Application.DTOs.Playlist;

public class PlaylistSummaryDto
{
    public long PlaylistId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Visibility { get; set; } = string.Empty;
    public int TrackCount { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CoverImageUrl { get; set; }
}
