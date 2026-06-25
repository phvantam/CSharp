namespace TuneVault.Domain.Entities;

public class Favorite
{
    public long FavoriteId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public long MediaItemId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ApplicationUser User { get; set; } = null!;
    public MediaItem MediaItem { get; set; } = null!;
}