using MediatR;
using TuneVault.Application.Features.Media.Commands.PlayMedia;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Media.Commands.PlayMedia;

public class PlayMediaCommandHandler : IRequestHandler<PlayMediaCommand, bool>
{
    private readonly IMediaService _mediaService;

    public PlayMediaCommandHandler(IMediaService mediaService)
    {
        _mediaService = mediaService;
    }

    public async Task<bool> Handle(PlayMediaCommand command, CancellationToken cancellationToken)
    {
        return await _mediaService.PlayMediaAsync(command.UserId, command.MediaItemId);
    }
}