using MediatR;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Features.Media.Queries.GetTrendingMedia;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Media.Queries.GetTrendingMedia;

public class GetTrendingMediaQueryHandler : IRequestHandler<GetTrendingMediaQuery, List<MediaItemDto>>
{
    private readonly IMediaService _mediaService;

    public GetTrendingMediaQueryHandler(IMediaService mediaService)
    {
        _mediaService = mediaService;
    }

    public async Task<List<MediaItemDto>> Handle(GetTrendingMediaQuery query, CancellationToken cancellationToken)
    {
        return await _mediaService.GetTrendingMediaAsync(query.Limit);
    }
}