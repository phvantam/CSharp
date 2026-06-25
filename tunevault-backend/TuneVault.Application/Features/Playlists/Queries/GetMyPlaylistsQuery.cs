using MediatR;
using TuneVault.Application.Features.Playlists.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Playlists.Queries;

public record GetMyPlaylistsQuery(string UserId) : IRequest<IEnumerable<PlaylistDto>>;

public class GetMyPlaylistsQueryHandler : IRequestHandler<GetMyPlaylistsQuery, IEnumerable<PlaylistDto>>
{
    private readonly IPlaylistRepository _playlistRepository;

    public GetMyPlaylistsQueryHandler(IPlaylistRepository playlistRepository)
    {
        _playlistRepository = playlistRepository;
    }

    public async Task<IEnumerable<PlaylistDto>> Handle(GetMyPlaylistsQuery request, CancellationToken cancellationToken)
    {
        var playlists = await _playlistRepository.GetByOwnerAsync(request.UserId);

        return playlists.Select(p => new PlaylistDto
        {
            Id           = p.Id,
            Title        = p.Title,
            Description  = p.Description,
            CoverImageUrl = p.CoverImageUrl,
            OwnerUserId  = p.OwnerUserId,
            CreatedAt    = p.CreatedAt
        });
    }
}