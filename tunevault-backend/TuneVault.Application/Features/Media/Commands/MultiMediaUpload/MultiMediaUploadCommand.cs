using MediatR;
using TuneVault.Application.DTOs.Media;

namespace TuneVault.Application.Features.Media.Commands.MultiMediaUpload;

public record MultiMediaUploadCommand(
    string UserId,
    MultiMediaUploadRequestDto Request,
    Stream? AudioStream,
    string? AudioFileName,
    Stream? VideoStream,
    string? VideoFileName,
    Stream? ThumbnailStream,
    string? ThumbnailFileName
) : IRequest<MultiMediaUploadResultDto>;
