using MediatR;
using TuneVault.Application.DTOs.Media;

namespace TuneVault.Application.Features.Media.Commands.UploadMedia;

public record UploadMediaCommand(
    string UserId,
    MediaUploadRequestDto Request,
    Stream FileStream,
    string FileName,
    string ContentType
) : IRequest<MediaUploadResultDto>;