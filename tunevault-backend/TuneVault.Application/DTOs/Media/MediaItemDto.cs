namespace TuneVault.Application.DTOs.Media;

public class MediaArtistDto
{
    public int ArtistId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? AvatarUrl { get; set; }
    public string Role { get; set; } = "Primary";
    public int Position { get; set; }
}

public class MediaItemDto
{
    public long MediaItemId { get; set; }

    public string? OwnerUserId { get; set; }
    public string? OwnerDisplayName { get; set; }

    public int? ArtistId { get; set; }
    public string ArtistName { get; set; } = string.Empty;
    public List<MediaArtistDto> Artists { get; set; } = new();

    public int? AlbumId { get; set; }
    public string? AlbumTitle { get; set; }

    public string Title { get; set; } = string.Empty;
    public string? VideoTitle { get; set; }
    public string? Slug { get; set; }
    public string? Description { get; set; }
    public string? Lyrics { get; set; }

    public string MediaType { get; set; } = string.Empty;
    public string? Genre { get; set; }

    public int DurationSeconds { get; set; }
    public long? PlayCount { get; set; }
    public int LikeCount { get; set; }

    public string FilePath { get; set; } = string.Empty;
    public string? AudioUrl { get; set; }
    public string? VideoUrl { get; set; }
    public string? ThumbnailUrl { get; set; }

    public string? Visibility { get; set; }
    public bool HasVideo { get; set; }

    public DateTime CreatedAt { get; set; }
}
