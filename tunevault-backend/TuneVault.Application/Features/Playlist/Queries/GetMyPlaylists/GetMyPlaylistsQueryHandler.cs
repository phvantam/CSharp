using MediatR;
using TuneVault.Application.DTOs.Playlist;
using TuneVault.Application.Features.Playlist.Queries.GetMyPlaylists;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Playlist.Queries.GetMyPlaylists;

public class GetMyPlaylistsQueryHandler : IRequestHandler<GetMyPlaylistsQuery, List<PlaylistSummaryDto>>
{
    private readonly IPlaylistService _playlistService;

    public GetMyPlaylistsQueryHandler(IPlaylistService playlistService)
    {
        _playlistService = playlistService;
    }

    public async Task<List<PlaylistSummaryDto>> Handle(GetMyPlaylistsQuery query, CancellationToken cancellationToken)
    {
        return await _playlistService.GetUserPlaylistsAsync(query.UserId);
    }
}