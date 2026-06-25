using MediatR;

namespace TuneVault.Application.Features.Notification.Commands.MarkAllAsRead;

public record MarkAllAsReadCommand(string UserId) : IRequest<bool>;