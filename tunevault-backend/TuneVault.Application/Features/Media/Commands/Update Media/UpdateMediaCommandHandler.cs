using MediatR;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Features.Media.Commands.UpdateMedia;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Media.Commands.UpdateMedia;

public class UpdateMediaCommandHandler : IRequestHandler<UpdateMediaCommand, bool>
{
    private readonly IMediaService _mediaService;

    public UpdateMediaCommandHandler(IMediaService mediaService)
    {
        _mediaService = mediaService;
    }

    public async Task<bool> Handle(UpdateMediaCommand command, CancellationToken cancellationToken)
    {
        var visibility = command.Request.Visibility;

        if (command.Request.IsPublic.HasValue)
        {
            visibility = command.Request.IsPublic.Value ? "Public" : "Private";
        }

        var request = new UpdateMediaRequest
        {
            Title = command.Request.Title,
            Description = command.Request.Description,
            Artist = command.Request.Artist,
            Album = command.Request.Album,
            Genre = command.Request.Genre,
            Lyrics = command.Request.Lyrics,
            Visibility = visibility,
            IsPublic = command.Request.IsPublic,
            ThumbnailFile = command.Request.ThumbnailFile
        };

        return await _mediaService.UpdateMediaAsync(command.MediaId, command.UserId, request);
    }
}
