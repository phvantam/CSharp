using MediatR;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Features.Media.Queries.GetNewReleases;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Media.Queries.GetNewReleases;

public class GetNewReleasesQueryHandler : IRequestHandler<GetNewReleasesQuery, List<MediaItemDto>>
{
    private readonly IMediaService _mediaService;

    public GetNewReleasesQueryHandler(IMediaService mediaService)
    {
        _mediaService = mediaService;
    }

    public async Task<List<MediaItemDto>> Handle(GetNewReleasesQuery query, CancellationToken cancellationToken)
    {
        return await _mediaService.GetNewReleasesAsync(query.Limit);
    }
}