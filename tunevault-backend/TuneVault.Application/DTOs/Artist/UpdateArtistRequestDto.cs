using Microsoft.AspNetCore.Http;

namespace TuneVault.Application.DTOs.Artist;

public class UpdateArtistRequestDto
{
    public string? Name { get; set; }
    public string? Bio { get; set; }
    public string? Country { get; set; }

    // AvatarFile = ảnh đại diện tròn của artist
    public IFormFile? AvatarFile { get; set; }

    // ImageFile = ảnh bìa/banner của artist, lưu vào Artists.ImageUrl
    public IFormFile? ImageFile { get; set; }
}
