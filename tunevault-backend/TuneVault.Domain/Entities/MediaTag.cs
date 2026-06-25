namespace TuneVault.Domain.Entities;

public class MediaTag
{
    public long MediaTagId { get; set; }
    public long MediaItemId { get; set; }
    public string TagName { get; set; } = string.Empty;
    public decimal Confidence { get; set; }
    public string CreatedBy { get; set; } = "AI";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public MediaItem MediaItem { get; set; } = null!;
}