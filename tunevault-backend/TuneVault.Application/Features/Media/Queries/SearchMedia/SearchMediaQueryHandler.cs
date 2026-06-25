using MediatR;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Media.Queries.SearchMedia;

public class SearchMediaQueryHandler
    : IRequestHandler<SearchMediaQuery, List<MediaSearchResultDto>>
{
    private readonly IMediaService _mediaService;

    public SearchMediaQueryHandler(IMediaService mediaService)
    {
        _mediaService = mediaService;
    }

    public async Task<List<MediaSearchResultDto>> Handle(
        SearchMediaQuery query,
        CancellationToken cancellationToken)
    {
        return await _mediaService.SearchMediaAsync(
            query.Keyword,
            query.Page,
            query.PageSize
        );
    }
}
