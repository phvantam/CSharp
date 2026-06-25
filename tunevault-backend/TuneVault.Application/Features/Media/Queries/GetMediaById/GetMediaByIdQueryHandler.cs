using MediatR;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Features.Media.Queries.GetMediaById;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Media.Queries.GetMediaById;

public class GetMediaByIdQueryHandler : IRequestHandler<GetMediaByIdQuery, MediaItemDto?>
{
    private readonly IMediaService _mediaService;

    public GetMediaByIdQueryHandler(IMediaService mediaService)
    {
        _mediaService = mediaService;
    }

    public async Task<MediaItemDto?> Handle(GetMediaByIdQuery query, CancellationToken cancellationToken)
    {
        return await _mediaService.GetMediaByIdAsync(query.MediaItemId);
    }
}