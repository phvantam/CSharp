using System;

namespace TuneVault.Domain.Entities;

public class Follow
{
    public long FollowId { get; set; }

    public string FollowerUserId { get; set; } = null!;

    public string? TargetUserId { get; set; }

    public int? TargetArtistId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual AppUser FollowerUser { get; set; } = null!;

    public virtual Artist? TargetArtist { get; set; }

    public virtual AppUser? TargetUser { get; set; }

    // Helper property for backward compatibility
    public string? FollowingUserId
    {
        get => TargetUserId;
        set => TargetUserId = value;
    }
}
