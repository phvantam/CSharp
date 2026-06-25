using FluentValidation;
using TuneVault.Application.Features.Playlist.Commands.DeletePlaylist;

namespace TuneVault.Application.Features.Playlist.Commands.DeletePlaylist;

public class DeletePlaylistCommandValidator : AbstractValidator<DeletePlaylistCommand>
{
    public DeletePlaylistCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.PlaylistId).GreaterThan(0);
    }
}