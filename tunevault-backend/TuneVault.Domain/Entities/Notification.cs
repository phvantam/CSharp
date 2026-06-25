using System.ComponentModel.DataAnnotations;

namespace TuneVault.Domain.Entities;

public class Notification
{
    [Key]
    public long NotificationId { get; set; }

    [Required]
    public string UserId { get; set; } = string.Empty;   // Người nhận thông báo

    [Required]
    public string Title { get; set; } = string.Empty;

    public string? Message { get; set; }

    public string? Type { get; set; }                    // MediaShare, PlaylistShare, Follow, System

    public long? ReferenceId { get; set; }               // ID liên quan, ví dụ MediaShareId

    public string? SenderUserId { get; set; }            // Người tạo ra thông báo, ví dụ người share/follow

    public string? ActionUrl { get; set; }               // Link frontend cần mở khi click thông báo

    public bool IsRead { get; set; } = false;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    public ApplicationUser? User { get; set; }
}
