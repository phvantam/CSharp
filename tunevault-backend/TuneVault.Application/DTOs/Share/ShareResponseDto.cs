namespace TuneVault.Application.DTOs.Share;

public class ShareResponseDto
{
    public long ShareId { get; set; }
    public string SenderUserId { get; set; } = string.Empty;
    public string ReceiverUserId { get; set; } = string.Empty;
    public long? MediaItemId { get; set; }
    public long? PlaylistId { get; set; }
    public string? Message { get; set; }
    public DateTime SharedAt { get; set; }
    public string ShareType { get; set; } = "Media";

    // true = đã từng chia sẻ trước đó, không tạo bản ghi mới, không gửi notification mới
    public bool IsDuplicate { get; set; }
}
