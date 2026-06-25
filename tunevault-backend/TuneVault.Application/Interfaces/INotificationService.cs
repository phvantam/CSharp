using TuneVault.Application.DTOs.Notification;

namespace TuneVault.Application.Interfaces;

public interface INotificationService
{
    Task SendNotificationAsync(
        string userId,
        string title,
        string? message = null,
        string? type = null,
        long? referenceId = null,
        string? senderUserId = null,
        string? actionUrl = null);

    Task<List<NotificationDto>> GetUserNotificationsAsync(string userId);

    Task<bool> MarkAsReadAsync(long notificationId, string userId);

    Task MarkAllAsReadAsync(string userId);
}
