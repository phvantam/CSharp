using MediatR;
using TuneVault.Application.DTOs.Share;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Share.Commands.SharePlaylist;

public class SharePlaylistCommandHandler : IRequestHandler<SharePlaylistCommand, ShareResponseDto>
{
    private readonly IShareService _shareService;

    public SharePlaylistCommandHandler(IShareService shareService)
    {
        _shareService = shareService;
    }

    public async Task<ShareResponseDto> Handle(
        SharePlaylistCommand command,
        CancellationToken cancellationToken)
    {
        return await _shareService.SharePlaylistAsync(
            command.SenderUserId,
            command.PlaylistId,
            command.ReceiverUserId,
            command.Message
        );
    }
}
