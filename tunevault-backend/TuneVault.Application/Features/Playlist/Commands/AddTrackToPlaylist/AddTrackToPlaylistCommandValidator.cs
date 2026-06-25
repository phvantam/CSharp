using FluentValidation;
using TuneVault.Application.Features.Playlist.Commands.AddTrackToPlaylist;

namespace TuneVault.Application.Features.Playlist.Commands.AddTrackToPlaylist;

public class AddTrackToPlaylistCommandValidator : AbstractValidator<AddTrackToPlaylistCommand>
{
    public AddTrackToPlaylistCommandValidator()
    {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("UserId không được để trống");

        RuleFor(x => x.PlaylistId)
            .GreaterThan(0)
            .WithMessage("PlaylistId phải lớn hơn 0");

        RuleFor(x => x.MediaItemId)
            .GreaterThan(0)
            .WithMessage("MediaItemId phải lớn hơn 0");
    }
}