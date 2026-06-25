using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using TuneVault.Application.DTOs.Notification;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;
using TuneVault.Infrastructure.Hubs;
using TuneVault.Infrastructure.Persistence;

namespace TuneVault.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHubContext<NotificationHub> _hubContext;
    private readonly ApplicationDbContext _context;

    public NotificationService(
        IUnitOfWork unitOfWork,
        IHubContext<NotificationHub> hubContext,
        ApplicationDbContext context)
    {
        _unitOfWork = unitOfWork;
        _hubContext = hubContext;
        _context = context;
    }

    public async Task SendNotificationAsync(
        string userId,
        string title,
        string? message = null,
        string? type = null,
        long? referenceId = null,
        string? senderUserId = null,
        string? actionUrl = null)
    {
        var normalizedType = string.IsNullOrWhiteSpace(type) ? "System" : type.Trim();

        actionUrl ??= ResolveActionUrl(normalizedType, senderUserId);

        var notification = new Notification
        {
            UserId = userId,
            Title = title,
            Message = message,
            Type = normalizedType,
            ReferenceId = referenceId,
            SenderUserId = senderUserId,
            ActionUrl = actionUrl,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        await _unitOfWork.Notifications.AddAsync(notification);
        await _unitOfWork.CompleteAsync();

        ApplicationUser? sender = null;
        if (!string.IsNullOrWhiteSpace(senderUserId))
        {
            sender = await _context.Users.FirstOrDefaultAsync(u => u.Id == senderUserId);
        }

        await _hubContext.Clients.Group(userId).SendAsync("ReceiveNotification", new
        {
            notificationId = notification.NotificationId,
            title = notification.Title,
            message = notification.Message,
            body = notification.Message,
            type = notification.Type,
            referenceId = notification.ReferenceId,
            senderUserId = notification.SenderUserId,
            senderName = GetDisplayName(sender),
            senderAvatarUrl = sender?.AvatarUrl,
            actionUrl = notification.ActionUrl,
            createdAt = notification.CreatedAt,
            isRead = notification.IsRead
        });
    }

    public async Task<List<NotificationDto>> GetUserNotificationsAsync(string userId)
    {
        var notifications = await _context.Notifications
            .AsNoTracking()
            .Where(n => n.UserId == userId)
            .OrderByDescending(n => n.CreatedAt)
            .ToListAsync();

        var senderIds = notifications
            .Where(n => !string.IsNullOrWhiteSpace(n.SenderUserId))
            .Select(n => n.SenderUserId!)
            .Distinct()
            .ToList();

        var senders = senderIds.Count == 0
            ? new Dictionary<string, ApplicationUser>()
            : await _context.Users
                .AsNoTracking()
                .Where(u => senderIds.Contains(u.Id))
                .ToDictionaryAsync(u => u.Id);

        return notifications.Select(n =>
        {
            senders.TryGetValue(n.SenderUserId ?? string.Empty, out var sender);

            return new NotificationDto
            {
                NotificationId = n.NotificationId,
                Title = n.Title,
                Message = n.Message,
                Body = n.Message,
                Type = n.Type,
                ReferenceId = n.ReferenceId,
                SenderUserId = n.SenderUserId,
                SenderName = GetDisplayName(sender),
                SenderAvatarUrl = sender?.AvatarUrl,
                ActionUrl = n.ActionUrl ?? ResolveActionUrl(n.Type, n.SenderUserId),
                CreatedAt = n.CreatedAt,
                IsRead = n.IsRead
            };
        }).ToList();
    }

    public async Task<bool> MarkAsReadAsync(long notificationId, string userId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.NotificationId == notificationId && n.UserId == userId);

        if (notification == null) return false;

        if (!notification.IsRead)
        {
            notification.IsRead = true;
            await _context.SaveChangesAsync();
        }

        return true;
    }

    public async Task MarkAllAsReadAsync(string userId)
    {
        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync();

        foreach (var noti in notifications)
        {
            noti.IsRead = true;
        }

        await _context.SaveChangesAsync();
    }

    private static string? ResolveActionUrl(string? type, string? senderUserId)
    {
        var normalizedType = (type ?? string.Empty).Trim().ToLowerInvariant();

        return normalizedType switch
        {
            "mediashare" => "/share-inbox",
            "playlistshare" => "/share-inbox",
            "follow" when !string.IsNullOrWhiteSpace(senderUserId) => $"/profile/{senderUserId}",
            _ => null
        };
    }

    private static string? GetDisplayName(ApplicationUser? user)
    {
        if (user == null)
            return null;

        if (!string.IsNullOrWhiteSpace(user.DisplayName))
            return user.DisplayName;

        if (!string.IsNullOrWhiteSpace(user.UserName))
            return user.UserName;

        if (!string.IsNullOrWhiteSpace(user.Email))
            return user.Email;

        return null;
    }
}
