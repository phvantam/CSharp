using Microsoft.EntityFrameworkCore;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence;

public class NotificationRepository : INotificationRepository
{
    private readonly TuneVaultDbContext _context;

    public NotificationRepository(TuneVaultDbContext context)
    {
        _context = context;
    }

    // 1. Lấy danh sách thông báo theo UserId (Đã ép kiểu sang Guid)
    public async Task<IEnumerable<Notification>> GetByUserIdAsync(string userId)
    {
        if (!Guid.TryParse(userId, out Guid userGuid))
        {
            return Enumerable.Empty<Notification>();
        }

        return await _context.Notifications
            .Where(n => n.UserId == userGuid) // Sửa lỗi so sánh Guid == Guid
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();
    }

    // 2. Lấy chi tiết 1 thông báo theo Guid Id
    public async Task<Notification?> GetByIdAsync(Guid id)
    {
        return await _context.Notifications.FindAsync(id);
    }

    // 3. Thêm mới thông báo
    public async Task AddAsync(Notification notification)
    {
        await _context.Notifications.AddAsync(notification);
        await _context.SaveChangesAsync();
    }

    // 4. Đánh dấu ĐÃ ĐỌC một thông báo cụ thể
    public async Task MarkAsReadAsync(Guid id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification != null)
        {
            notification.IsRead = true; 
            await _context.SaveChangesAsync();
        }
    }

    // 5. Đánh dấu ĐÃ ĐỌC TẤT CẢ thông báo của một User (Đã ép kiểu sang Guid)
    public async Task MarkAllAsReadAsync(string userId)
    {
        if (!Guid.TryParse(userId, out Guid userGuid))
        {
            return;
        }

        var unreadNotifications = await _context.Notifications
            .Where(n => n.UserId == userGuid && !n.IsRead) // Sửa lỗi so sánh Guid == Guid
            .ToListAsync();

        foreach (var notification in unreadNotifications)
        {
            notification.IsRead = true;
        }

        await _context.SaveChangesAsync();
    }

    // 6. Xóa một thông báo
    public async Task DeleteAsync(Guid id)
    {
        var notification = await _context.Notifications.FindAsync(id);
        if (notification != null)
        {
            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();
        }
    }
}