using MediatR;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Features.Media.Queries.GetUserMedia;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Media.Queries.GetUserMedia;

public class GetUserMediaQueryHandler : IRequestHandler<GetUserMediaQuery, List<MediaItemDto>>
{
    private readonly IMediaService _mediaService;

    public GetUserMediaQueryHandler(IMediaService mediaService)
    {
        _mediaService = mediaService;
    }

    public async Task<List<MediaItemDto>> Handle(GetUserMediaQuery query, CancellationToken cancellationToken)
    {
        return await _mediaService.GetUserMediaAsync(query.UserId, query.Page, query.PageSize);
    }
}