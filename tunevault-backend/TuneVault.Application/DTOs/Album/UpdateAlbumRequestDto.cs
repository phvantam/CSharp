using Microsoft.AspNetCore.Http;

namespace TuneVault.Application.DTOs.Album;

public class UpdateAlbumRequestDto
{
    public int? ArtistId { get; set; }
    public string? Artist { get; set; }
    public string? ArtistName { get; set; }
    public string? Title { get; set; }
    public string? Description { get; set; }
    public DateTime? ReleaseDate { get; set; }
    public string? AlbumType { get; set; }
    public IFormFile? CoverImageFile { get; set; }
}
