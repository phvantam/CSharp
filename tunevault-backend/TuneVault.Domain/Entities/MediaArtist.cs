namespace TuneVault.Domain.Entities;

public class MediaArtist
{
    public long MediaItemId { get; set; }
    public int ArtistId { get; set; }
    public string Role { get; set; } = "Primary";
    public int Position { get; set; } = 0;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public MediaItem MediaItem { get; set; } = null!;
    public Artist Artist { get; set; } = null!;
}
