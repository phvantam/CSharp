using TuneVault.Application.DTOs.Album;
using TuneVault.Application.DTOs.Media;

namespace TuneVault.Application.DTOs.Artist;

public class ArtistDetailDto
{
    public int ArtistId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Slug { get; set; }
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string? ImageUrl { get; set; }
    public string? Country { get; set; }
    public bool IsVerified { get; set; }

    public int FollowerCount { get; set; }
    public int SongCount { get; set; }
    public int AlbumCount { get; set; }
    public long TotalPlayCount { get; set; }

    public bool CanEdit { get; set; }
    public bool CanManageManagers { get; set; }
    public string? MyArtistRole { get; set; }
    public bool IsFollowing { get; set; }

    public List<MediaItemDto> TopSongs { get; set; } = new();
    public List<AlbumDto> Albums { get; set; } = new();
}
