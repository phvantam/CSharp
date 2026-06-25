using MediatR;
using TuneVault.Application.Features.Playlists.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Playlists.Queries;

public record GetPlaylistByIdQuery(Guid PlaylistId, string UserId) : IRequest<PlaylistDetailDto>;

public class GetPlaylistByIdQueryHandler : IRequestHandler<GetPlaylistByIdQuery, PlaylistDetailDto>
{
    private readonly IPlaylistRepository _playlistRepository;

    public GetPlaylistByIdQueryHandler(IPlaylistRepository playlistRepository)
    {
        _playlistRepository = playlistRepository;
    }

    public async Task<PlaylistDetailDto> Handle(GetPlaylistByIdQuery request, CancellationToken cancellationToken)
    {
        var playlist = await _playlistRepository.GetByIdAsync(request.PlaylistId)
            ?? throw new KeyNotFoundException("Playlist not found");

        return new PlaylistDetailDto
        {
            Id            = playlist.Id,
            Title         = playlist.Title,
            Description   = playlist.Description,
            CoverImageUrl = playlist.CoverImageUrl,
            OwnerUserId   = playlist.OwnerUserId,
            CreatedAt     = playlist.CreatedAt,
            Items         = new List<PlaylistItemDto>() // sẽ load sau khi có IPlaylistItemRepository
        };
    }
}