using MediatR;
using TuneVault.Application.Common;
using TuneVault.Domain.Interfaces;

namespace TuneVault.Application.Features.Notifications;

// --- Get Notifications ---
public record GetNotificationsQuery(string UserId) : IRequest<ApiResponse>;

public sealed class GetNotificationsQueryHandler : IRequestHandler<GetNotificationsQuery, ApiResponse>
{
    private readonly INotificationRepository _notificationRepository;
    public GetNotificationsQueryHandler(INotificationRepository notificationRepository) => _notificationRepository = notificationRepository;

    public async Task<ApiResponse> Handle(GetNotificationsQuery request, CancellationToken cancellationToken)
    {
        var notifications = await _notificationRepository.GetByUserIdAsync(request.UserId);
        return ApiResponse.Ok(notifications);
    }
}

// --- Mark Notification Read ---
public record MarkNotificationReadCommand(long NotificationId, string UserId) : IRequest<ApiResponse>;

public sealed class MarkNotificationReadCommandHandler : IRequestHandler<MarkNotificationReadCommand, ApiResponse>
{
    private readonly INotificationRepository _notificationRepository;
    public MarkNotificationReadCommandHandler(INotificationRepository notificationRepository) => _notificationRepository = notificationRepository;

    public async Task<ApiResponse> Handle(MarkNotificationReadCommand request, CancellationToken cancellationToken)
    {
        var success = await _notificationRepository.MarkAsReadAsync(request.NotificationId, request.UserId);
        return success ? ApiResponse.Ok(null) : ApiResponse.Fail("Notification not found");
    }
}

// --- Mark All Read ---
public record MarkAllNotificationsReadCommand(string UserId) : IRequest<ApiResponse>;

public sealed class MarkAllNotificationsReadCommandHandler : IRequestHandler<MarkAllNotificationsReadCommand, ApiResponse>
{
    private readonly INotificationRepository _notificationRepository;
    public MarkAllNotificationsReadCommandHandler(INotificationRepository notificationRepository) => _notificationRepository = notificationRepository;

    public async Task<ApiResponse> Handle(MarkAllNotificationsReadCommand request, CancellationToken cancellationToken)
    {
        await _notificationRepository.MarkAllAsReadAsync(request.UserId);
        return ApiResponse.Ok(null);
    }
}
