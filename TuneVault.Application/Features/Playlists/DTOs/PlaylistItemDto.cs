namespace TuneVault.Application.Features.Playlists.DTOs;

public class PlaylistItemDto
{
    public Guid Id { get; set; }
    public Guid MediaItemId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string ArtistName { get; set; } = string.Empty;
    public int DurationSeconds { get; set; }
    public int Order { get; set; }
}