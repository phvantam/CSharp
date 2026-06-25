using System;

namespace TuneVault.Domain.Entities;

public class UserProfile
{
    public int UserProfileId { get; set; }

    public string UserId { get; set; } = null!;

    public string FullName { get; set; } = null!;

    public string? CoverImageUrl { get; set; }

    public string? City { get; set; }

    public string? Country { get; set; }

    public string? WebsiteUrl { get; set; }

    public string? FacebookUrl { get; set; }

    public string PrivacyLevel { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public DateTime UpdatedAt { get; set; }

    public virtual AppUser User { get; set; } = null!;
}
