using MediatR;
using TuneVault.Application.Features.Playlist.Commands.DeletePlaylist;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Playlist.Commands.DeletePlaylist;

public class DeletePlaylistCommandHandler : IRequestHandler<DeletePlaylistCommand, bool>
{
    private readonly IPlaylistService _playlistService;

    public DeletePlaylistCommandHandler(IPlaylistService playlistService)
    {
        _playlistService = playlistService;
    }

    public async Task<bool> Handle(DeletePlaylistCommand command, CancellationToken cancellationToken)
    {
        return await _playlistService.DeletePlaylistAsync(command.PlaylistId, command.UserId);
    }
}