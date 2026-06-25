using FluentValidation;
using MediatR;
using TuneVault.Application.Common;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;

namespace TuneVault.Application.Features.ShareMedia;

// --- Share Media ---
public record ShareMediaCommand(string SenderUserId, string ReceiverUserId, long? MediaItemId, long? PlaylistId, string? Message) : IRequest<ApiResponse>;

public sealed class ShareMediaCommandValidator : AbstractValidator<ShareMediaCommand>
{
    public ShareMediaCommandValidator()
    {
        RuleFor(x => x.SenderUserId).NotEmpty();
        RuleFor(x => x.ReceiverUserId).NotEmpty();
        RuleFor(x => x).Must(x => x.SenderUserId != x.ReceiverUserId)
            .WithMessage("Cannot share with yourself");
        RuleFor(x => x).Must(x => x.MediaItemId.HasValue || x.PlaylistId.HasValue)
            .WithMessage("Must share either a media item or playlist");
    }
}

public sealed class ShareMediaCommandHandler : IRequestHandler<ShareMediaCommand, ApiResponse>
{
    private readonly IShareRepository _shareRepository;
    private readonly INotificationRepository _notificationRepository;
    private readonly IUserRepository _userRepository;

    public ShareMediaCommandHandler(IShareRepository shareRepository, INotificationRepository notificationRepository, IUserRepository userRepository)
    {
        _shareRepository = shareRepository;
        _notificationRepository = notificationRepository;
        _userRepository = userRepository;
    }

    public async Task<ApiResponse> Handle(ShareMediaCommand request, CancellationToken cancellationToken)
    {
        // Verify receiver exists
        var receiver = await _userRepository.GetByIdAsync(request.ReceiverUserId);
        if (receiver is null) return ApiResponse.Fail("Receiver user not found");

        var share = new MediaShare
        {
            SenderUserId = request.SenderUserId,
            ReceiverUserId = request.ReceiverUserId,
            MediaItemId = request.MediaItemId,
            PlaylistId = request.PlaylistId,
            Message = request.Message,
            ShareType = request.PlaylistId.HasValue ? "Playlist" : "Media",
            CreatedAt = DateTime.UtcNow
        };

        var created = await _shareRepository.CreateAsync(share);

        // Create notification
        var notification = new Notification
        {
            UserId = request.ReceiverUserId,
            Title = "New Media Shared",
            Type = "MediaShared",
            Body = "Someone shared media with you",
            ActorUserId = request.SenderUserId,
            CreatedAt = DateTime.UtcNow,
            PayloadJson = $"{{\"mediaShareId\": {created.MediaShareId}}}"
        };
        await _notificationRepository.CreateAsync(notification);

        return ApiResponse.Ok(created);
    }
}

// --- Get Share Inbox ---
public record GetShareInboxQuery(string UserId) : IRequest<ApiResponse>;

public sealed class GetShareInboxQueryHandler : IRequestHandler<GetShareInboxQuery, ApiResponse>
{
    private readonly IShareRepository _shareRepository;
    public GetShareInboxQueryHandler(IShareRepository shareRepository) => _shareRepository = shareRepository;

    public async Task<ApiResponse> Handle(GetShareInboxQuery request, CancellationToken cancellationToken)
    {
        var shares = await _shareRepository.GetSharedWithMeAsync(request.UserId);
        return ApiResponse.Ok(shares);
    }
}

// --- Get Share Sent ---
public record GetShareSentQuery(string UserId) : IRequest<ApiResponse>;

public sealed class GetShareSentQueryHandler : IRequestHandler<GetShareSentQuery, ApiResponse>
{
    private readonly IShareRepository _shareRepository;
    public GetShareSentQueryHandler(IShareRepository shareRepository) => _shareRepository = shareRepository;

    public async Task<ApiResponse> Handle(GetShareSentQuery request, CancellationToken cancellationToken)
    {
        var shares = await _shareRepository.GetSharedByMeAsync(request.UserId);
        return ApiResponse.Ok(shares);
    }
}
