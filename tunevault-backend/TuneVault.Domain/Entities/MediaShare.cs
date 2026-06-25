namespace TuneVault.Domain.Entities;

public class MediaShare
{
    public long MediaShareId { get; set; }
    public string SenderUserId { get; set; } = string.Empty;
    public string ReceiverUserId { get; set; } = string.Empty;
    public long? MediaItemId { get; set; }
    public long? PlaylistId { get; set; }
    public string? Message { get; set; }
    public string ShareType { get; set; } = "Media"; // Media hoặc Playlist
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAt { get; set; }
    public bool IsRevoked { get; set; } = false;

    // Navigation
    public ApplicationUser Sender { get; set; } = null!;
    public ApplicationUser Receiver { get; set; } = null!;
    public MediaItem? MediaItem { get; set; }
    public Playlist? Playlist { get; set; }
}