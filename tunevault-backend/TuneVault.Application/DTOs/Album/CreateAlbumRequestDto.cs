using Microsoft.AspNetCore.Http;

namespace TuneVault.Application.DTOs.Album;

public class CreateAlbumRequestDto
{
    public int ArtistId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public DateTime? ReleaseDate { get; set; }
    public string AlbumType { get; set; } = "Album";
    public IFormFile? CoverImageFile { get; set; }
}
