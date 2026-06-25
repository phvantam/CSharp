using MediatR;
using TuneVault.Application.DTOs.Notification;
using TuneVault.Application.Features.Notification.Queries.GetMyNotifications;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Notification.Queries.GetMyNotifications;

public class GetMyNotificationsQueryHandler : IRequestHandler<GetMyNotificationsQuery, List<NotificationDto>>
{
    private readonly INotificationService _notificationService;

    public GetMyNotificationsQueryHandler(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    public async Task<List<NotificationDto>> Handle(GetMyNotificationsQuery query, CancellationToken cancellationToken)
    {
        return await _notificationService.GetUserNotificationsAsync(query.UserId);
    }
}