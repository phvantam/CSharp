using FluentValidation;
using TuneVault.Application.Features.Media.Commands.MultiMediaUpload;

namespace TuneVault.Application.Features.Media.Commands.MultiMediaUpload;

public class MultiMediaUploadCommandValidator : AbstractValidator<MultiMediaUploadCommand>
{
    public MultiMediaUploadCommandValidator()
    {
        // Title bắt buộc
        RuleFor(x => x.Request.Title)
            .NotEmpty().WithMessage("Tên bài hát không được để trống")
            .MaximumLength(200).WithMessage("Tên bài hát không được vượt quá 200 ký tự");

        // Thumbnail bắt buộc
        RuleFor(x => x.ThumbnailStream)
            .NotNull().WithMessage("Ảnh bìa (Thumbnail) là bắt buộc");

        RuleFor(x => x.ThumbnailFileName)
            .NotEmpty().WithMessage("Tên file ảnh bìa không hợp lệ");

        // Phải có ít nhất 1 file media (Audio hoặc Video)
        RuleFor(x => x)
            .Must(x => x.AudioStream != null || x.VideoStream != null)
            .WithMessage("Phải upload ít nhất 1 file Audio hoặc Video");

        // Validate Artist nếu có
        RuleFor(x => x.Request.Artist)
            .MaximumLength(100).WithMessage("Tên nghệ sĩ không được vượt quá 100 ký tự")
            .When(x => !string.IsNullOrWhiteSpace(x.Request.Artist));
    }
}