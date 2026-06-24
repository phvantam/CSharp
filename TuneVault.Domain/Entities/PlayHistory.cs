using System;

namespace TuneVault.Domain.Entities;

public class PlayHistory
{
    public long PlayHistoryId { get; set; }

    public string UserId { get; set; } = null!;

    public long MediaItemId { get; set; }

    public DateTime StartedAt { get; set; }

    public DateTime LastPlayedAt { get; set; }

    public int ProgressSeconds { get; set; }

    public bool IsCompleted { get; set; }

    public string? DeviceInfo { get; set; }

    public string? IpAddress { get; set; }

    public virtual MediaItem MediaItem { get; set; } = null!;

    public virtual AppUser User { get; set; } = null!;

    // Helper property for backward compatibility
    public DateTime PlayedAt
    {
        get => LastPlayedAt;
        set { LastPlayedAt = value; if (StartedAt == default) StartedAt = value; }
    }
}
