using MediatR;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Features.PlayHistory.Queries.GetPlayHistory;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.PlayHistory.Queries.GetPlayHistory;

public class GetPlayHistoryQueryHandler : IRequestHandler<GetPlayHistoryQuery, List<MediaItemDto>>
{
    private readonly IMediaService _mediaService;

    public GetPlayHistoryQueryHandler(IMediaService mediaService)
    {
        _mediaService = mediaService;
    }

    public async Task<List<MediaItemDto>> Handle(GetPlayHistoryQuery query, CancellationToken cancellationToken)
    {
        // Trả về danh sách MediaItemDto (dễ dùng hơn cho frontend)
        return await _mediaService.GetPlayHistoryAsync(query.UserId, query.Limit);
    }
}