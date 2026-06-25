using MediatR;
using TuneVault.Application.DTOs.Share;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Share.Queries.GetSentShares;

public class GetSentSharesQueryHandler
    : IRequestHandler<GetSentSharesQuery, List<ShareInboxDto>>
{
    private readonly IShareService _shareService;

    public GetSentSharesQueryHandler(IShareService shareService)
    {
        _shareService = shareService;
    }

    public async Task<List<ShareInboxDto>> Handle(
        GetSentSharesQuery query,
        CancellationToken cancellationToken)
    {
        return await _shareService.GetSentSharesAsync(query.UserId);
    }
}