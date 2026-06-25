using TuneVault.Application.DTOs.Media;

namespace TuneVault.Application.DTOs.Album;

public class AlbumDto
{
    public int AlbumId { get; set; }
    public int ArtistId { get; set; }
    public string ArtistName { get; set; } = string.Empty;

    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string? CoverImageUrl { get; set; }
    public DateTime? ReleaseDate { get; set; }
    public string AlbumType { get; set; } = "Single";

    public int TrackCount { get; set; }
    public long TotalPlayCount { get; set; }
    public int TotalLikeCount { get; set; }

    public bool CanEdit { get; set; }
    public bool CanDelete { get; set; }
    public bool CanManageTracks { get; set; }
}

public class AlbumDetailDto : AlbumDto
{
    public List<MediaItemDto> Tracks { get; set; } = new();
}
