using System;

namespace TuneVault.Domain.Entities;

public class PlaylistTrack
{
    public long PlaylistTrackId { get; set; }

    public long PlaylistId { get; set; }

    public long MediaItemId { get; set; }

    public int Position { get; set; }

    public string AddedByUserId { get; set; } = null!;

    public DateTime AddedAt { get; set; }

    public virtual AppUser AddedByUser { get; set; } = null!;

    public virtual MediaItem MediaItem { get; set; } = null!;

    public virtual Playlist Playlist { get; set; } = null!;
}
