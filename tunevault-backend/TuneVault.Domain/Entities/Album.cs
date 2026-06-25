namespace TuneVault.Domain.Entities;

public class Album
{
    public int AlbumId { get; set; }
    public int ArtistId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateTime? ReleaseDate { get; set; }
    public string AlbumType { get; set; } = "Single";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public Artist Artist { get; set; } = null!;
    public ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();
}