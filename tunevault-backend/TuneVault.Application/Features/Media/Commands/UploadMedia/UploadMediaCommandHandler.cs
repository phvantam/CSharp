using MediatR;
using FluentValidation;
using TuneVault.Application.Common;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Features.Media.Commands.UploadMedia;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Media.Commands.UploadMedia;

public class UploadMediaCommandHandler : IRequestHandler<UploadMediaCommand, MediaUploadResultDto>
{
    private readonly IMediaService _mediaService;

    public UploadMediaCommandHandler(IMediaService mediaService)
    {
        _mediaService = mediaService;
    }

    public async Task<MediaUploadResultDto> Handle(UploadMediaCommand command, CancellationToken cancellationToken)
    {
        if (command.FileStream == null || command.FileStream.Length == 0)
            throw new ArgumentException("File không hợp lệ hoặc rỗng");

        var fileName = command.FileName;
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        var contentType = command.ContentType.ToLowerInvariant();

        // Validate extension
        bool isValidExtension = AllowedFileTypes.AllowedExtensions
            .Values.Any(extensions => extensions.Contains(extension));

        if (!isValidExtension)
            throw new ValidationException("Định dạng file không được hỗ trợ.");

        // Validate MIME type
        if (!AllowedFileTypes.AllowedMimeTypes.TryGetValue(extension, out var expectedMime) ||
            expectedMime != contentType)
            throw new ValidationException("Loại file không hợp lệ.");

        // Gọi service với DTO
        return await _mediaService.UploadMediaAsync(
            command.FileStream,
            command.FileName,
            command.ContentType,
            command.UserId,
            command.Request
        );
    }
}