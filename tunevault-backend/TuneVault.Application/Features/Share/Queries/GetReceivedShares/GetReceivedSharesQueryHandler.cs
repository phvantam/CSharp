using MediatR;
using TuneVault.Application.DTOs.Share;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Share.Queries.GetReceivedShares;

public class GetReceivedSharesQueryHandler
    : IRequestHandler<GetReceivedSharesQuery, List<ShareInboxDto>>
{
    private readonly IShareService _shareService;

    public GetReceivedSharesQueryHandler(IShareService shareService)
    {
        _shareService = shareService;
    }

    public async Task<List<ShareInboxDto>> Handle(
        GetReceivedSharesQuery query,
        CancellationToken cancellationToken)
    {
        return await _shareService.GetReceivedSharesAsync(query.UserId);
    }
}