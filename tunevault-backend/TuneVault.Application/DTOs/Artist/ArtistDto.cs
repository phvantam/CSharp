namespace TuneVault.Application.DTOs.Artist;

public class ArtistDto
{
    public int ArtistId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
}