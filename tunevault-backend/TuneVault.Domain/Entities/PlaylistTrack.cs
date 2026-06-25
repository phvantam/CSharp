namespace TuneVault.Domain.Entities;

public class PlaylistTrack
{
    public long PlaylistTrackId { get; set; }
    public long PlaylistId { get; set; }
    public long MediaItemId { get; set; }
    public int Position { get; set; }
    public string AddedByUserId { get; set; } = string.Empty;
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Playlist Playlist { get; set; } = null!;
    public MediaItem MediaItem { get; set; } = null!;
    public ApplicationUser AddedByUser { get; set; } = null!;
}