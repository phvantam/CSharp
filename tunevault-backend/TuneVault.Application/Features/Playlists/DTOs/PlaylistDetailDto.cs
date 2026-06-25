namespace TuneVault.Application.Features.Playlists.DTOs;

public class PlaylistDetailDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public Guid OwnerUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<PlaylistItemDto> Items { get; set; } = new();
}