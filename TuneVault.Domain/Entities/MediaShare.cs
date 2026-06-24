using System;

namespace TuneVault.Domain.Entities;

public class MediaShare
{
    public long MediaShareId { get; set; }

    public string SenderUserId { get; set; } = null!;

    public string ReceiverUserId { get; set; } = null!;

    public long? MediaItemId { get; set; }

    public long? PlaylistId { get; set; }

    public string? Message { get; set; }

    public string ShareType { get; set; } = "Media";

    public DateTime CreatedAt { get; set; }

    public DateTime? RevokedAt { get; set; }

    public bool IsRevoked { get; set; }

    public virtual MediaItem? MediaItem { get; set; }

    public virtual Playlist? Playlist { get; set; }

    public virtual AppUser ReceiverUser { get; set; } = null!;

    public virtual AppUser SenderUser { get; set; } = null!;
}
