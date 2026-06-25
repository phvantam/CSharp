using MediatR;
using TuneVault.Application.Features.Notification.Commands.MarkAllAsRead;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Notification.Commands.MarkAllAsRead;

public class MarkAllAsReadCommandHandler : IRequestHandler<MarkAllAsReadCommand, bool>
{
    private readonly INotificationService _notificationService;

    public MarkAllAsReadCommandHandler(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    public async Task<bool> Handle(MarkAllAsReadCommand command, CancellationToken cancellationToken)
    {
        await _notificationService.MarkAllAsReadAsync(command.UserId);
        return true;
    }
}