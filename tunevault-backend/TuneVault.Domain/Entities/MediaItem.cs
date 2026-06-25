namespace TuneVault.Domain.Entities;

public class MediaItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Url { get; set; } = null!;         
    public string MediaType { get; set; } = null!;
    public int Duration { get; set; }
    public Guid? UserId { get; set; } 
    public DateTime CreatedAt { get; set; }
}