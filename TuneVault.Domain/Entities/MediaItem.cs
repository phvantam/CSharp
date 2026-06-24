using System;
using System.Collections.Generic;

namespace TuneVault.Domain.Entities;

public class MediaItem
{
    public long MediaItemId { get; set; }

    public string OwnerUserId { get; set; } = null!;

    public int ArtistId { get; set; }

    public int? AlbumId { get; set; }

    public string Title { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string? Description { get; set; }

    public string MediaType { get; set; } = "Audio";

    public string? Genre { get; set; }

    public int DurationSeconds { get; set; }

    public string FilePath { get; set; } = null!;

    public string? ExternalUrl { get; set; }

    public string? ThumbnailUrl { get; set; }

    public string MimeType { get; set; } = "audio/mpeg";

    public long FileSizeBytes { get; set; }

    public string Visibility { get; set; } = "Public";

    public int PlayCount { get; set; }

    public bool IsProcessed { get; set; } = true;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual Album? Album { get; set; }

    public virtual Artist Artist { get; set; } = null!;

    public virtual AppUser Owner { get; set; } = null!;

    // Navigation collections
    public virtual ICollection<Favorite> Favorites { get; set; } = new List<Favorite>();

    public virtual ICollection<MediaShare> MediaShares { get; set; } = new List<MediaShare>();

    public virtual ICollection<PlayHistory> PlayHistories { get; set; } = new List<PlayHistory>();

    public virtual ICollection<PlaylistTrack> PlaylistTracks { get; set; } = new List<PlaylistTrack>();

    // Computed Properties for Backward Compatibility
    public string? ArtistName => Artist?.Name;
    public string? AlbumTitle => Album?.Title;
    public string? OwnerDisplayName => Owner?.DisplayName;
}
