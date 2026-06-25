using MediatR;
using TuneVault.Application.DTOs.Notification;

namespace TuneVault.Application.Features.Notification.Queries.GetMyNotifications;

public record GetMyNotificationsQuery(string UserId) : IRequest<List<NotificationDto>>;