using System;
using System.Collections.Generic;

namespace TuneVault.Domain.Entities;

public class Artist
{
    public int ArtistId { get; set; }

    public string Name { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string? Bio { get; set; }

    public string? Country { get; set; }

    public string? ImageUrl { get; set; }

    public bool IsVerified { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual ICollection<Album> Albums { get; set; } = new List<Album>();

    public virtual ICollection<Follow> Follows { get; set; } = new List<Follow>();

    public virtual ICollection<MediaItem> MediaItems { get; set; } = new List<MediaItem>();
}
