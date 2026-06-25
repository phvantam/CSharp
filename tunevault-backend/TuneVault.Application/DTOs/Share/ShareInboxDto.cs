namespace TuneVault.Application.DTOs.Share;

public class ShareInboxDto
{
    public long Id { get; set; }
    public long ShareId { get; set; }

    public string SenderUserId { get; set; } = string.Empty;
    public string SenderName { get; set; } = string.Empty;

    public string ReceiverUserId { get; set; } = string.Empty;
    public string ReceiverName { get; set; } = string.Empty;
    public long? MediaItemId { get; set; }
    public long? PlaylistId { get; set; }

    public string Title { get; set; } = string.Empty;
    public string? ArtistName { get; set; }
    public string? Message { get; set; }

    public DateTime SharedAt { get; set; }

    public string Type { get; set; } = string.Empty;
    public bool HasVideo { get; set; }
}