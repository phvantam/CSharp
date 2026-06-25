using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Playlist.Commands.RemoveSongFromPlaylist;

public class RemoveSongFromPlaylistCommandHandler
    : IRequestHandler<RemoveSongFromPlaylistCommand, bool>
{
    private readonly IPlaylistService _playlistService;

    public RemoveSongFromPlaylistCommandHandler(IPlaylistService playlistService)
    {
        _playlistService = playlistService;
    }

    public async Task<bool> Handle(
        RemoveSongFromPlaylistCommand command,
        CancellationToken cancellationToken)
    {
        return await _playlistService.RemoveSongFromPlaylistAsync(
            command.PlaylistId,
            command.UserId,
            command.MediaItemId
        );
    }
}
