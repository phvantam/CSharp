using MediatR;
using TuneVault.Application.Features.Share.DTOs;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Share.Commands;

public record ShareMediaCommand(
    string SenderUserId,
    string ReceiverUserId,
    Guid? MediaItemId,
    Guid? PlaylistId,
    string? Message
) : IRequest<ShareDto>;

public class ShareMediaCommandHandler : IRequestHandler<ShareMediaCommand, ShareDto>
{
    private readonly IShareRepository       _shareRepository;
    private readonly IUserRepository        _userRepository;
    private readonly IMediaRepository       _mediaRepository;
    private readonly IPlaylistRepository    _playlistRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly INotificationService   _notificationService;

    public ShareMediaCommandHandler(
        IShareRepository shareRepository,
        IUserRepository userRepository,
        IMediaRepository mediaRepository,
        IPlaylistRepository playlistRepository,
        INotificationRepository notificationRepository,
        INotificationService notificationService)
    {
        _shareRepository        = shareRepository;
        _userRepository         = userRepository;
        _mediaRepository        = mediaRepository;
        _playlistRepository     = playlistRepository;
        _notificationRepository = notificationRepository;
        _notificationService    = notificationService;
    }

    public async Task<ShareDto> Handle(ShareMediaCommand request, CancellationToken cancellationToken)
    {
        // 1. Không share cho chính mình
        if (request.SenderUserId == request.ReceiverUserId)
            throw new InvalidOperationException("Cannot share with yourself");

        // 2. Phải có ít nhất mediaItemId hoặc playlistId
        if (request.MediaItemId is null && request.PlaylistId is null)
            throw new InvalidOperationException("Must provide mediaItemId or playlistId");

        // 3. Kiểm tra receiver tồn tại
        var receiver = await _userRepository.GetByIdAsync(request.ReceiverUserId)
            ?? throw new KeyNotFoundException("Receiver user not found");

        // 4. Kiểm tra media tồn tại (nếu có)
        if (request.MediaItemId is not null)
        {
            _ = await _mediaRepository.GetByIdAsync(request.MediaItemId.Value)
                ?? throw new KeyNotFoundException("Media item not found");
        }

        // 5. Kiểm tra playlist tồn tại (nếu có)
        if (request.PlaylistId is not null)
        {
            _ = await _playlistRepository.GetByIdAsync(request.PlaylistId.Value)
                ?? throw new KeyNotFoundException("Playlist not found");
        }

        // 6. Idempotent: kiểm tra đã share chưa
        var exists = await _shareRepository.ExistsShareAsync(
            request.SenderUserId,
            request.ReceiverUserId,
            request.MediaItemId,
            request.PlaylistId
        );
        if (exists)
            throw new InvalidOperationException("Already shared");

        // 7. Tạo Share record
        var share = new TuneVault.Domain.Entities.Share
        {
            Id             = Guid.NewGuid(),
            SenderUserId   = Guid.Parse(request.SenderUserId),
            ReceiverUserId = Guid.Parse(request.ReceiverUserId),
            MediaItemId    = request.MediaItemId,
            PlaylistId     = request.PlaylistId,
            Message        = request.Message,
            SharedAt       = DateTime.UtcNow
        };

        await _shareRepository.AddAsync(share);

        // 8. Tạo Notification record
        var notification = new Notification
        {
            Id        = Guid.NewGuid(),
            UserId    = Guid.Parse(request.ReceiverUserId),
            Title     = "New share",
            Message   = request.Message ?? "Someone shared media with you",
            IsRead    = false,
            CreatedAt = DateTime.UtcNow
        };

        await _notificationRepository.AddAsync(notification);

        // 9. Push realtime qua SignalR
        await _notificationService.PushAsync(
            request.ReceiverUserId,
            notification.Title,
            notification.Message
        );

        return new ShareDto
        {
            Id             = share.Id,
            SenderUserId   = share.SenderUserId,
            ReceiverUserId = share.ReceiverUserId,
            MediaItemId    = share.MediaItemId,
            PlaylistId     = share.PlaylistId,
            Message        = share.Message,
            SharedAt       = share.SharedAt
        };
    }
}