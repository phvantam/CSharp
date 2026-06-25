namespace TuneVault.Application.DTOs.Playlist;

public class CreatePlaylistRequestDto
{
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public bool IsPublic { get; set; } = true;

    public string? CoverImageUrl { get; set; }
}
