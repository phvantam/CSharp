using System;
using System.Collections.Generic;

namespace TuneVault.Domain.Entities;

public class Playlist
{
    public long PlaylistId { get; set; }

    public string OwnerUserId { get; set; } = null!;

    public string Title { get; set; } = null!;

    public string Slug { get; set; } = null!;

    public string? Description { get; set; }

    public string? CoverImageUrl { get; set; }

    public string Visibility { get; set; } = "Private";

    public bool IsCollaborative { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual AppUser Owner { get; set; } = null!;

    public virtual ICollection<PlaylistTrack> Tracks { get; set; } = new List<PlaylistTrack>();

    public virtual ICollection<MediaShare> MediaShares { get; set; } = new List<MediaShare>();
}
