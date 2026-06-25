using FluentValidation;
using TuneVault.Application.Features.Share.Commands.ShareMedia;

namespace TuneVault.Application.Features.Share.Commands.ShareMedia;

public class ShareMediaCommandValidator : AbstractValidator<ShareMediaCommand>
{
    public ShareMediaCommandValidator()
    {
        RuleFor(x => x.SenderUserId).NotEmpty();
        RuleFor(x => x.Request.ReceiverUserId).NotEmpty();
        RuleFor(x => x.Request).Must(r => r.MediaItemId.HasValue || r.PlaylistId.HasValue)
            .WithMessage("Phải cung cấp MediaItemId hoặc PlaylistId.");
    }
}