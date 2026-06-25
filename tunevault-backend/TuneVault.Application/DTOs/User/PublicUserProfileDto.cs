namespace TuneVault.Application.DTOs.User;

public class PublicUserProfileDto
{
    public string UserId { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? AvatarUrl { get; set; }
    public string? Bio { get; set; }
    public string PrivacyLevel { get; set; } = "Public";
    public DateTime? CreatedAt { get; set; }

    public int FollowerCount { get; set; }
    public int FollowingCount { get; set; }
    public bool IsFollowing { get; set; }
}
