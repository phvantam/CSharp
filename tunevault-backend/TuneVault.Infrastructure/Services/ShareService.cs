using Microsoft.EntityFrameworkCore;
using TuneVault.Application.DTOs.Share;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;
using TuneVault.Infrastructure.Persistence;

namespace TuneVault.Infrastructure.Services;

public class ShareService : IShareService
{
    private readonly ApplicationDbContext _context;
    private readonly IUnitOfWork _unitOfWork;
    private readonly INotificationService _notificationService;

    public ShareService(
        ApplicationDbContext context,
        IUnitOfWork unitOfWork,
        INotificationService notificationService)
    {
        _context = context;
        _unitOfWork = unitOfWork;
        _notificationService = notificationService;
    }

    public async Task<ShareResponseDto> ShareMediaAsync(string senderUserId, ShareMediaRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(senderUserId))
            throw new UnauthorizedAccessException("Không xác định được người gửi.");

        if (string.IsNullOrWhiteSpace(request.ReceiverUserId))
            throw new Exception("Vui lòng chọn người nhận.");

        if (senderUserId == request.ReceiverUserId)
            throw new Exception("Không thể chia sẻ cho chính mình.");

        if (request.MediaItemId == null && request.PlaylistId == null)
            throw new Exception("Phải cung cấp MediaItemId hoặc PlaylistId.");

        if (request.MediaItemId.HasValue && request.PlaylistId.HasValue)
            throw new Exception("Chỉ được chia sẻ bài hát hoặc playlist trong một lần.");

        return request.MediaItemId.HasValue
            ? await ShareMediaItemInternalAsync(senderUserId, request.ReceiverUserId, request.MediaItemId.Value, request.Message)
            : await SharePlaylistAsync(senderUserId, request.PlaylistId!.Value, request.ReceiverUserId, request.Message);
    }

    public async Task<ShareResponseDto> SharePlaylistAsync(
        string senderUserId,
        long playlistId,
        string receiverUserId,
        string? message = null)
    {
        if (string.IsNullOrWhiteSpace(senderUserId))
            throw new UnauthorizedAccessException("Không xác định được người gửi.");

        if (string.IsNullOrWhiteSpace(receiverUserId))
            throw new Exception("Vui lòng chọn người nhận.");

        if (senderUserId == receiverUserId)
            throw new Exception("Không thể chia sẻ cho chính mình.");

        var receiverExists = await _context.Users
            .AnyAsync(u => u.Id == receiverUserId);

        if (!receiverExists)
            throw new Exception("Người nhận không tồn tại.");

        var playlist = await _context.Playlists
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.PlaylistId == playlistId);

        if (playlist == null)
            throw new Exception("Playlist không tồn tại.");

        // Playlist riêng tư chỉ chủ sở hữu được share.
        if (playlist.Visibility == "Private" && playlist.OwnerUserId != senderUserId)
            throw new Exception("Bạn không có quyền chia sẻ playlist riêng tư này.");

        var existingShare = await _context.MediaShares
            .FirstOrDefaultAsync(s =>
                !s.IsRevoked &&
                s.SenderUserId == senderUserId &&
                s.ReceiverUserId == receiverUserId &&
                s.MediaItemId == null &&
                s.PlaylistId == playlistId &&
                s.ShareType == "Playlist");

        if (existingShare != null)
            return ToShareResponse(existingShare, isDuplicate: true);

        var sender = await _context.Users.FindAsync(senderUserId);
        var senderName = GetDisplayName(sender);

        var share = new MediaShare
        {
            SenderUserId = senderUserId,
            ReceiverUserId = receiverUserId,
            MediaItemId = null,
            PlaylistId = playlistId,
            ShareType = "Playlist",
            Message = message,
            CreatedAt = DateTime.UtcNow,
            IsRevoked = false
        };

        await _context.MediaShares.AddAsync(share);
        await _context.SaveChangesAsync();

        await _notificationService.SendNotificationAsync(
            userId: receiverUserId,
            title: $"{senderName} đã chia sẻ một playlist",
            message: BuildShareMessage(message, "Playlist", playlist.Title),
            type: "PlaylistShare",
            referenceId: share.MediaShareId,
            senderUserId: senderUserId,
            actionUrl: "/share-inbox"
        );

        return ToShareResponse(share, isDuplicate: false);
    }

    private async Task<ShareResponseDto> ShareMediaItemInternalAsync(
        string senderUserId,
        string receiverUserId,
        long mediaItemId,
        string? message)
    {
        var receiverExists = await _context.Users
            .AnyAsync(u => u.Id == receiverUserId);

        if (!receiverExists)
            throw new Exception("Người nhận không tồn tại.");

        var media = await _context.MediaItems
            .AsNoTracking()
            .FirstOrDefaultAsync(m => m.MediaItemId == mediaItemId);

        if (media == null)
            throw new Exception("Bài hát không tồn tại.");

        var existingShare = await _context.MediaShares
            .FirstOrDefaultAsync(s =>
                !s.IsRevoked &&
                s.SenderUserId == senderUserId &&
                s.ReceiverUserId == receiverUserId &&
                s.MediaItemId == mediaItemId &&
                s.PlaylistId == null &&
                s.ShareType == "Media");

        if (existingShare != null)
            return ToShareResponse(existingShare, isDuplicate: true);

        var sender = await _context.Users.FindAsync(senderUserId);
        var senderName = GetDisplayName(sender);

        var share = new MediaShare
        {
            SenderUserId = senderUserId,
            ReceiverUserId = receiverUserId,
            MediaItemId = mediaItemId,
            PlaylistId = null,
            ShareType = "Media",
            Message = message,
            CreatedAt = DateTime.UtcNow,
            IsRevoked = false
        };

        await _unitOfWork.MediaShares.AddAsync(share);
        await _unitOfWork.CompleteAsync();

        await _notificationService.SendNotificationAsync(
            userId: receiverUserId,
            title: $"{senderName} đã chia sẻ một bài hát",
            message: BuildShareMessage(message, "Bài hát", media.Title),
            type: "MediaShare",
            referenceId: share.MediaShareId,
            senderUserId: senderUserId,
            actionUrl: "/share-inbox"
        );

        return ToShareResponse(share, isDuplicate: false);
    }

    public async Task<List<ShareInboxDto>> GetReceivedSharesAsync(string userId)
    {
        var shares = await _context.MediaShares
            .Where(s => s.ReceiverUserId == userId && !s.IsRevoked)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        shares = DeduplicateShares(shares);

        var result = new List<ShareInboxDto>();

        foreach (var share in shares)
        {
            result.Add(await BuildShareInboxDtoAsync(share));
        }

        return result;
    }

    public async Task<List<ShareInboxDto>> GetSentSharesAsync(string userId)
    {
        var shares = await _context.MediaShares
            .Where(s => s.SenderUserId == userId && !s.IsRevoked)
            .OrderByDescending(s => s.CreatedAt)
            .ToListAsync();

        shares = DeduplicateShares(shares);

        var result = new List<ShareInboxDto>();

        foreach (var share in shares)
        {
            result.Add(await BuildShareInboxDtoAsync(share));
        }

        return result;
    }

    public async Task<List<ShareInboxDto>> GetShareInboxAsync(string userId)
    {
        return await GetReceivedSharesAsync(userId);
    }

    private async Task<ShareInboxDto> BuildShareInboxDtoAsync(MediaShare share)
    {
        var sender = await _context.Users.FindAsync(share.SenderUserId);
        var receiver = await _context.Users.FindAsync(share.ReceiverUserId);

        var dto = new ShareInboxDto
        {
            Id = share.MediaShareId,
            ShareId = share.MediaShareId,
            SenderUserId = share.SenderUserId,
            SenderName = GetDisplayName(sender),
            ReceiverUserId = share.ReceiverUserId,
            ReceiverName = GetDisplayName(receiver),
            MediaItemId = share.MediaItemId,
            PlaylistId = share.PlaylistId,
            Message = share.Message,
            SharedAt = share.CreatedAt
        };

        if (share.MediaItemId.HasValue)
        {
            var media = await _context.MediaItems
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.MediaItemId == share.MediaItemId.Value);

            dto.Type = "Media";
            dto.Title = media?.Title ?? "Media không tồn tại";
            dto.ArtistName = null;
            dto.HasVideo = !string.IsNullOrWhiteSpace(media?.VideoFilePath);
        }
        else if (share.PlaylistId.HasValue)
        {
            var playlist = await _context.Playlists
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.PlaylistId == share.PlaylistId.Value);

            dto.Type = "Playlist";
            dto.Title = playlist?.Title ?? "Playlist không tồn tại";
            dto.HasVideo = false;
        }
        else
        {
            dto.Type = "Unknown";
            dto.Title = "Nội dung không tồn tại";
            dto.HasVideo = false;
        }

        return dto;
    }

    private static List<MediaShare> DeduplicateShares(List<MediaShare> shares)
    {
        return shares
            .GroupBy(s => new
            {
                s.SenderUserId,
                s.ReceiverUserId,
                s.MediaItemId,
                s.PlaylistId,
                s.ShareType
            })
            .Select(g => g.OrderByDescending(s => s.CreatedAt).First())
            .OrderByDescending(s => s.CreatedAt)
            .ToList();
    }

    private static ShareResponseDto ToShareResponse(MediaShare share, bool isDuplicate)
    {
        return new ShareResponseDto
        {
            ShareId = share.MediaShareId,
            SenderUserId = share.SenderUserId,
            ReceiverUserId = share.ReceiverUserId,
            MediaItemId = share.MediaItemId,
            PlaylistId = share.PlaylistId,
            Message = share.Message,
            SharedAt = share.CreatedAt,
            ShareType = share.ShareType,
            IsDuplicate = isDuplicate
        };
    }

    private static string BuildShareMessage(string? userMessage, string label, string itemTitle)
    {
        var itemInfo = $"{label}: {itemTitle}";

        if (string.IsNullOrWhiteSpace(userMessage))
            return itemInfo;

        return $"“{userMessage.Trim()}” • {itemInfo}";
    }

    private static string GetDisplayName(ApplicationUser? user)
    {
        if (user == null)
            return "Unknown User";

        if (!string.IsNullOrWhiteSpace(user.DisplayName))
            return user.DisplayName;

        if (!string.IsNullOrWhiteSpace(user.UserName))
            return user.UserName;

        if (!string.IsNullOrWhiteSpace(user.Email))
            return user.Email;

        return "Unknown User";
    }
}
