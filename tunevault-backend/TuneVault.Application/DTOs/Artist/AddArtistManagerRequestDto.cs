namespace TuneVault.Application.DTOs.Artist;

public class AddArtistManagerRequestDto
{
    public string UserId { get; set; } = string.Empty;
    public string Role { get; set; } = "Editor";
}
