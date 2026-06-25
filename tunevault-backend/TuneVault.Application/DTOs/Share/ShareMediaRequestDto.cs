namespace TuneVault.Application.DTOs.Share;

public class ShareMediaRequestDto
{
    public long? MediaItemId { get; set; }
    public long? PlaylistId { get; set; }
    public string ReceiverUserId { get; set; } = string.Empty;
    public string? Message { get; set; }
}