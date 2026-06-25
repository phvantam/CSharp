using MediatR;

namespace TuneVault.Application.Features.Notification.Commands.MarkAsRead;

public record MarkAsReadCommand(string UserId, long NotificationId) : IRequest<bool>;