using MediatR;
using TuneVault.Application.Common;
using TuneVault.Domain.Interfaces;

namespace TuneVault.Application.Features.Search;

// --- Search Media ---
public record SearchMediaQuery(string Query) : IRequest<ApiResponse>;

public sealed class SearchMediaQueryHandler : IRequestHandler<SearchMediaQuery, ApiResponse>
{
    private readonly IMediaRepository _mediaRepository;
    public SearchMediaQueryHandler(IMediaRepository mediaRepository) => _mediaRepository = mediaRepository;

    public async Task<ApiResponse> Handle(SearchMediaQuery request, CancellationToken cancellationToken)
    {
        var results = await _mediaRepository.SearchAsync(request.Query);
        var list = results.ToList();
        return ApiResponse.Ok(new PagedResult<object>(
            list.Cast<object>().ToList(), 1, 20, list.Count));
    }
}

// --- Search Playlists ---
public record SearchPlaylistsQuery(string Query, string? UserId) : IRequest<ApiResponse>;

public sealed class SearchPlaylistsQueryHandler : IRequestHandler<SearchPlaylistsQuery, ApiResponse>
{
    private readonly IPlaylistRepository _playlistRepository;
    private readonly IUserRepository _userRepository;

    public SearchPlaylistsQueryHandler(IPlaylistRepository playlistRepository, IUserRepository userRepository)
    {
        _playlistRepository = playlistRepository;
        _userRepository = userRepository;
    }

    public async Task<ApiResponse> Handle(SearchPlaylistsQuery request, CancellationToken cancellationToken)
    {
        var results = await _playlistRepository.SearchAsync(request.Query, request.UserId);
        var dtos = new List<object>();
        foreach (var p in results)
        {
            var owner = await _userRepository.GetByIdAsync(p.OwnerUserId);
            dtos.Add(new
            {
                playlistId = p.PlaylistId, ownerUserId = p.OwnerUserId,
                title = p.Title, visibility = p.Visibility,
                isCollaborative = p.IsCollaborative,
                creator = owner?.DisplayName ?? "TuneVault",
                trackCount = p.Tracks.Count
            });
        }
        return ApiResponse.Ok(dtos);
    }
}

// --- Search Albums ---
public record SearchAlbumsQuery(string Query) : IRequest<ApiResponse>;

public sealed class SearchAlbumsQueryHandler : IRequestHandler<SearchAlbumsQuery, ApiResponse>
{
    private readonly IAlbumRepository _albumRepository;
    private readonly IUserRepository _userRepository;

    public SearchAlbumsQueryHandler(IAlbumRepository albumRepository, IUserRepository userRepository)
    {
        _albumRepository = albumRepository;
        _userRepository = userRepository;
    }

    public async Task<ApiResponse> Handle(SearchAlbumsQuery request, CancellationToken cancellationToken)
    {
        var results = await _albumRepository.SearchAsync(request.Query);
        var dtos = new List<object>();
        foreach (var a in results)
        {
            var owner = string.IsNullOrEmpty(a.OwnerUserId) ? null : await _userRepository.GetByIdAsync(a.OwnerUserId);
            dtos.Add(new
            {
                albumId = a.AlbumId, ownerUserId = a.OwnerUserId,
                title = a.Title, artistName = a.ArtistName,
                description = a.Description, coverImageUrl = a.CoverImageUrl,
                createdAt = a.CreatedAt, updatedAt = a.UpdatedAt,
                creatorName = owner?.DisplayName ?? "TuneVault"
            });
        }
        return ApiResponse.Ok(dtos);
    }
}
