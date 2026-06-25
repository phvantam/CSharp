using FluentValidation;
using TuneVault.Application.Features.Media.Commands.UploadMedia;

namespace TuneVault.Application.Features.Media.Commands.UploadMedia;

public class UploadMediaCommandValidator : AbstractValidator<UploadMediaCommand>
{
    public UploadMediaCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();

        RuleFor(x => x.Request)
            .NotNull()
            .WithMessage("Dữ liệu upload không được null");

        RuleFor(x => x.Request.Title)
            .NotEmpty()
            .WithMessage("Tiêu đề không được để trống")
            .MaximumLength(200)
            .WithMessage("Tiêu đề tối đa 200 ký tự");

        RuleFor(x => x.Request.MediaType)
            .Must(t => t == "Audio" || t == "Video")
            .WithMessage("MediaType phải là Audio hoặc Video");
    }
}