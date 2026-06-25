namespace TuneVault.Domain.Entities;

public class Artist
{
    public int ArtistId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Slug { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Country { get; set; }
    public string? ImageUrl { get; set; }
    public bool IsVerified { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public ICollection<Album> Albums { get; set; } = new List<Album>();
    public ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();
    public ICollection<MediaArtist> MediaArtists { get; set; } = new List<MediaArtist>();
    public ICollection<ArtistManager> Managers { get; set; } = new List<ArtistManager>();
}
