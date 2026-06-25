using MediatR;
using TuneVault.Application.Features.Notification.Commands.MarkAsRead;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Notification.Commands.MarkAsRead;

public class MarkAsReadCommandHandler : IRequestHandler<MarkAsReadCommand, bool>
{
    private readonly INotificationService _notificationService;

    public MarkAsReadCommandHandler(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    public async Task<bool> Handle(MarkAsReadCommand command, CancellationToken cancellationToken)
    {
        return await _notificationService.MarkAsReadAsync(command.NotificationId, command.UserId);
    }
}