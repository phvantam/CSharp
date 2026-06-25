namespace TuneVault.Application.DTOs.Share;

public class SharePlaylistRequestDto
{
    public long PlaylistId { get; set; }
    public string ReceiverUsername { get; set; } = string.Empty;
    public string ReceiverUserId { get; set; } = string.Empty;
    public string? Message { get; set; }
}