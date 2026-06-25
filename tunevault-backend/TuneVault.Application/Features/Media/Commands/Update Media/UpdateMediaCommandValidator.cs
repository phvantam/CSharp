using FluentValidation;
using TuneVault.Application.Features.Media.Commands.UpdateMedia;

namespace TuneVault.Application.Features.Media.Commands.UpdateMedia;

public class UpdateMediaCommandValidator : AbstractValidator<UpdateMediaCommand>
{
    public UpdateMediaCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("UserId không được để trống");

        RuleFor(x => x.MediaId)
            .GreaterThan(0)
            .WithMessage("MediaId phải lớn hơn 0");

        RuleFor(x => x.Request)
            .NotNull()
            .WithMessage("Dữ liệu cập nhật không được null");

        // Validate Title (chỉ khi có giá trị)
        RuleFor(x => x.Request!.Title)
            .MaximumLength(200)
            .WithMessage("Tiêu đề tối đa 200 ký tự")
            .When(x => x.Request != null && !string.IsNullOrWhiteSpace(x.Request.Title));

        // Validate Description (chỉ khi có giá trị)
        RuleFor(x => x.Request!.Description)
            .MaximumLength(1000)
            .WithMessage("Mô tả tối đa 1000 ký tự")
            .When(x => x.Request != null && !string.IsNullOrWhiteSpace(x.Request.Description));
    }
}