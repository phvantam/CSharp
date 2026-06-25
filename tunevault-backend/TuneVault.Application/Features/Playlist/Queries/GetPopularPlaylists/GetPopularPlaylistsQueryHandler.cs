using MediatR;
using TuneVault.Application.DTOs.Playlist;
using TuneVault.Application.Features.Playlist.Queries.GetPopularPlaylists;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Playlist.Queries.GetPopularPlaylists;

public class GetPopularPlaylistsQueryHandler : IRequestHandler<GetPopularPlaylistsQuery, List<PlaylistSummaryDto>>
{
    private readonly IPlaylistService _playlistService;

    public GetPopularPlaylistsQueryHandler(IPlaylistService playlistService)
    {
        _playlistService = playlistService;
    }

    public async Task<List<PlaylistSummaryDto>> Handle(GetPopularPlaylistsQuery query, CancellationToken cancellationToken)
    {
        return await _playlistService.GetPopularPlaylistsAsync(query.Limit);
    }
}