using MediatR;
using TuneVault.Application.Features.Media.Commands.DeleteMedia;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Media.Commands.DeleteMedia;

public class DeleteMediaCommandHandler : IRequestHandler<DeleteMediaCommand, bool>
{
    private readonly IMediaService _mediaService;

    public DeleteMediaCommandHandler(IMediaService mediaService)
    {
        _mediaService = mediaService;
    }

    public async Task<bool> Handle(DeleteMediaCommand command, CancellationToken cancellationToken)
    {
        return await _mediaService.DeleteMediaAsync(command.UserId, command.MediaItemId);
    }
}