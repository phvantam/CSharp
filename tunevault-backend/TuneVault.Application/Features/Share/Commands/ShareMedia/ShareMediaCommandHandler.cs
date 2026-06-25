using MediatR;
using TuneVault.Application.DTOs.Share;
using TuneVault.Application.Features.Share.Commands.ShareMedia;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Share.Commands.ShareMedia;

public class ShareMediaCommandHandler : IRequestHandler<ShareMediaCommand, ShareResponseDto>
{
    private readonly IShareService _shareService;

    public ShareMediaCommandHandler(IShareService shareService)
    {
        _shareService = shareService;
    }

    public async Task<ShareResponseDto> Handle(ShareMediaCommand command, CancellationToken cancellationToken)
    {
        return await _shareService.ShareMediaAsync(command.SenderUserId, command.Request);
    }
}