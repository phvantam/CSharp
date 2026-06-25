using TuneVault.Application.DTOs.Share;

namespace TuneVault.Application.Interfaces;

public interface IShareService
{
    Task<ShareResponseDto> ShareMediaAsync(string senderUserId, ShareMediaRequestDto request);
    Task<List<ShareInboxDto>> GetReceivedSharesAsync(string userId);
    Task<List<ShareInboxDto>> GetSentSharesAsync(string userId);

    Task<ShareResponseDto> SharePlaylistAsync(
        string senderUserId,
        long playlistId,
        string receiverUserId,
        string? message = null
    );
}
