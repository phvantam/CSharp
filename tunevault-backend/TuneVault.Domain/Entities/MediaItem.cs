namespace TuneVault.Domain.Entities;

public class MediaItem
{
    public long MediaItemId { get; set; }
    public string OwnerUserId { get; set; } = string.Empty;
    public int? ArtistId { get; set; }
    public int? AlbumId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? VideoTitle { get; set; }
    public string Slug { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? Lyrics { get; set; }
    public string MediaType { get; set; } = "Audio"; // Audio / Video
    public string? Genre { get; set; }
    public int DurationSeconds { get; set; }
    public string FilePath { get; set; } = string.Empty;
    
    public string? ExternalUrl { get; set; }
    public string? ThumbnailUrl { get; set; }
    public string? AudioFilePath { get; set; } 
    public string? VideoFilePath { get; set; } 
    public string MimeType { get; set; } = string.Empty;
    public long FileSizeBytes { get; set; }
    public string Visibility { get; set; } = "Public";
    public int PlayCount { get; set; } = 0;
    public bool IsProcessed { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ApplicationUser Owner { get; set; } = null!;
    public Artist? Artist { get; set; }
    public Album? Album { get; set; }
    public ICollection<MediaArtist> MediaArtists { get; set; } = new List<MediaArtist>();
    public ICollection<MediaTag> MediaTags { get; set; } = new List<MediaTag>();
    public ICollection<PlaylistTrack> PlaylistTracks { get; set; } = new List<PlaylistTrack>();
}