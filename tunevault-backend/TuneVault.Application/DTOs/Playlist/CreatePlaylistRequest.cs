namespace TuneVault.Application.DTOs.Playlist;

public class CreatePlaylistRequest
{
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Visibility { get; set; } = "Public"; // Public / Private
    public string? CoverImageUrl { get; set; }
}
