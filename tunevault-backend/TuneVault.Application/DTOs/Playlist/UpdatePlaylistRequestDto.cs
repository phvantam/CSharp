namespace TuneVault.Application.DTOs.Playlist;

public class UpdatePlaylistRequestDto
{
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? Visibility { get; set; }
    public string? CoverImageUrl { get; set; }
}