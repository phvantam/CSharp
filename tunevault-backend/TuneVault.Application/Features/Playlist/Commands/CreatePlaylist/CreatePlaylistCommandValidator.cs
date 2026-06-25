using FluentValidation;
using TuneVault.Application.Features.Playlist.Commands.CreatePlaylist;

namespace TuneVault.Application.Features.Playlist.Commands.CreatePlaylist;

public class CreatePlaylistCommandValidator : AbstractValidator<CreatePlaylistCommand>
{
    public CreatePlaylistCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("UserId không được để trống");

        RuleFor(x => x.Request)
            .NotNull()
            .WithMessage("Dữ liệu playlist không được null");

        RuleFor(x => x.Request.Title)
            .NotEmpty()
            .WithMessage("Tên playlist không được để trống")
            .MaximumLength(150)
            .WithMessage("Tên playlist tối đa 150 ký tự");

        RuleFor(x => x.Request.Description)
            .MaximumLength(500)
            .WithMessage("Mô tả tối đa 500 ký tự")
            .When(x => !string.IsNullOrWhiteSpace(x.Request.Description));
    }
}