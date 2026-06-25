using MediatR;
using TuneVault.Application.DTOs.Artist;
using TuneVault.Application.Features.Artist.Queries.SearchArtists;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Artist.Queries.SearchArtists;

public class SearchArtistsQueryHandler : IRequestHandler<SearchArtistsQuery, List<ArtistDto>>
{
    private readonly IMediaService _mediaService;

    public SearchArtistsQueryHandler(IMediaService mediaService)
    {
        _mediaService = mediaService;
    }

    public async Task<List<ArtistDto>> Handle(SearchArtistsQuery query, CancellationToken cancellationToken)
    {
        return await _mediaService.SearchArtistsAsync(query.Keyword, query.Limit);
    }
}