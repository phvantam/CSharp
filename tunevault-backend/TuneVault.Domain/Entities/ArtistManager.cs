namespace TuneVault.Domain.Entities;

public class ArtistManager
{
    public long ArtistManagerId { get; set; }

    public int ArtistId { get; set; }
    public string UserId { get; set; } = string.Empty;

    // Owner / Editor / Viewer
    public string Role { get; set; } = "Editor";

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Artist Artist { get; set; } = null!;
    public ApplicationUser User { get; set; } = null!;
}
