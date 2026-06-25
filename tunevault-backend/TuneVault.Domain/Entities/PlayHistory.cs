namespace TuneVault.Domain.Entities;

public class PlayHistory
{
    public long PlayHistoryId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public long MediaItemId { get; set; }
    public DateTime StartedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastPlayedAt { get; set; } = DateTime.UtcNow;
    public int ProgressSeconds { get; set; } = 0;
    public bool IsCompleted { get; set; } = false;
    public string? DeviceInfo { get; set; }
    public string? IpAddress { get; set; }

    // Navigation
    public ApplicationUser User { get; set; } = null!;
    public MediaItem MediaItem { get; set; } = null!;
}