using System;
using System.Collections.Generic;

namespace TuneVault.Domain.Entities;

public class Album
{
    public int AlbumId { get; set; }

    public int ArtistId { get; set; }

    public string Title { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string? Description { get; set; }

    public string? CoverImageUrl { get; set; }

    public DateOnly? ReleaseDate { get; set; }

    public string AlbumType { get; set; } = "Single";

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public string? OwnerUserId { get; set; }

    public virtual AppUser? Owner { get; set; }

    public virtual Artist Artist { get; set; } = null!;

    public virtual ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();

    // Computed properties for backward compatibility
    public string? ArtistName => Artist?.Name;
}
