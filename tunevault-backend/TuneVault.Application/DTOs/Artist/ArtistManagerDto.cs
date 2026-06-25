namespace TuneVault.Application.DTOs.Artist;

public class ArtistManagerDto
{
    public long ArtistManagerId { get; set; }
    public int ArtistId { get; set; }
    public string UserId { get; set; } = string.Empty;
    public string? DisplayName { get; set; }
    public string? Email { get; set; }
    public string Role { get; set; } = "Editor";
    public DateTime CreatedAt { get; set; }
}
