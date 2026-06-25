using MediatR;
using TuneVault.Application.DTOs.Playlist;
using TuneVault.Application.Features.Playlist.Queries.GetPlaylistDetail;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Playlist.Queries.GetPlaylistDetail;

public class GetPlaylistDetailQueryHandler : IRequestHandler<GetPlaylistDetailQuery, PlaylistDetailDto?>
{
    private readonly IPlaylistService _playlistService;

    public GetPlaylistDetailQueryHandler(IPlaylistService playlistService)
    {
        _playlistService = playlistService;
    }

    public async Task<PlaylistDetailDto?> Handle(GetPlaylistDetailQuery query, CancellationToken cancellationToken)
    {
        return await _playlistService.GetPlaylistDetailAsync(query.PlaylistId);
    }
}