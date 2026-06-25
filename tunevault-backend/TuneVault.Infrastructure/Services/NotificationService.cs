using Microsoft.AspNetCore.SignalR;
using TuneVault.Application.Interfaces;
using TuneVault.Infrastructure.Hubs; // Đã đổi sang tầng Infrastructure sau khi di chuyển file Hub

namespace TuneVault.Infrastructure.Services;

public class NotificationService : INotificationService
{
    private readonly IHubContext<NotificationHub> _hubContext;

    public NotificationService(IHubContext<NotificationHub> hubContext)
    {
        _hubContext = hubContext;
    }

    public async Task PushAsync(string userId, string title, string message)
    {
        // Gửi realtime qua SignalR đến tài khoản người nhận
        await _hubContext.Clients
            .User(userId)
            .SendAsync("ReceiveNotification", new { title, message });
    }
}