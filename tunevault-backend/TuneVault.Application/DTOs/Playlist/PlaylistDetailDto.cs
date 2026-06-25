using TuneVault.Application.DTOs.Media;

namespace TuneVault.Application.DTOs.Playlist;

public class PlaylistDetailDto
{
    public long PlaylistId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Visibility { get; set; } = string.Empty;
    public string OwnerName { get; set; } = string.Empty;
    public int TrackCount { get; set; }
    public string? CoverImageUrl { get; set; }
    public List<MediaItemDto> Tracks { get; set; } = new();
}
