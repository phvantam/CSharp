namespace TuneVault.Application.DTOs.User;

public class UpdateProfileRequestDto
{
    public string FullName { get; set; } = string.Empty;
    public string? Bio { get; set; }
    public string? AvatarUrl { get; set; }
    public string PrivacyLevel { get; set; } = "Public";
}