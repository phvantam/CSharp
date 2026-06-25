using FluentValidation;
using TuneVault.Application.Features.Playlist.Commands.RemoveSongFromPlaylist;

namespace TuneVault.Application.Features.Playlist.Commands.RemoveSongFromPlaylist;

public class RemoveSongFromPlaylistCommandValidator : AbstractValidator<RemoveSongFromPlaylistCommand>
{
    public RemoveSongFromPlaylistCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.PlaylistId).GreaterThan(0);
        RuleFor(x => x.MediaItemId).GreaterThan(0);
    }
}