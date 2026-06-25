using MediatR;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Playlist.Commands.AddTrackToPlaylist;

public class AddTrackToPlaylistCommandHandler
    : IRequestHandler<AddTrackToPlaylistCommand, bool>
{
    private readonly IPlaylistService _playlistService;

    public AddTrackToPlaylistCommandHandler(IPlaylistService playlistService)
    {
        _playlistService = playlistService;
    }

    public async Task<bool> Handle(
        AddTrackToPlaylistCommand command,
        CancellationToken cancellationToken)
    {
        return await _playlistService.AddSongToPlaylistAsync(
            command.PlaylistId,
            command.UserId,
            command.MediaItemId
        );
    }
}
