namespace TuneVault.Application.DTOs.Notification;

public class NotificationDto
{
    public long NotificationId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string? Message { get; set; }

    public string? Body { get; set; }

    public string? Type { get; set; }

    public long? ReferenceId { get; set; }

    public string? SenderUserId { get; set; }

    public string? SenderName { get; set; }

    public string? SenderAvatarUrl { get; set; }

    public string? ActionUrl { get; set; }

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; }
}
