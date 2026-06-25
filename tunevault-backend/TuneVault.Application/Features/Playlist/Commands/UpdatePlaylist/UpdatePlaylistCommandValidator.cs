using FluentValidation;
using TuneVault.Application.Features.Playlist.Commands.UpdatePlaylist;

namespace TuneVault.Application.Features.Playlist.Commands.UpdatePlaylist;

public class UpdatePlaylistCommandValidator : AbstractValidator<UpdatePlaylistCommand>
{
    public UpdatePlaylistCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.PlaylistId).GreaterThan(0);
        RuleFor(x => x.Request).NotNull();
    }
}