namespace TuneVault.Domain.Entities;

public class Follow
{
    public long FollowId { get; set; }
    public string FollowerUserId { get; set; } = string.Empty;
    public string? TargetUserId { get; set; }
    public int? TargetArtistId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ApplicationUser Follower { get; set; } = null!;
    public ApplicationUser? TargetUser { get; set; }
    public Artist? TargetArtist { get; set; }
}