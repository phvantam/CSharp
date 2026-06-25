using MediatR;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Media.Commands.MultiMediaUpload;

public class MultiMediaUploadCommandHandler
    : IRequestHandler<MultiMediaUploadCommand, MultiMediaUploadResultDto>
{
    private readonly IMediaService _mediaService;

    public MultiMediaUploadCommandHandler(IMediaService mediaService)
    {
        _mediaService = mediaService;
    }

    public async Task<MultiMediaUploadResultDto> Handle(
        MultiMediaUploadCommand command,
        CancellationToken cancellationToken)
    {
        return await _mediaService.UploadMultiMediaAsync(
            command.UserId,
            command.Request,
            command.AudioStream,
            command.AudioFileName,
            command.VideoStream,
            command.VideoFileName,
            command.ThumbnailStream,
            command.ThumbnailFileName
        );
    }
}
