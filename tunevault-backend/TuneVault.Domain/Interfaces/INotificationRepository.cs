using TuneVault.Domain.Entities;

namespace TuneVault.Domain.Interfaces;

public interface INotificationRepository
{
    Task<Notification> CreateAsync(Notification notification);
    Task<IEnumerable<Notification>> GetByUserIdAsync(string userId);
    Task<bool> MarkAsReadAsync(long id, string userId);
    Task MarkAllAsReadAsync(string userId);
}
