using MediatR;
using TuneVault.Application.Features.Share.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Share.Queries;

public record GetSharedByMeQuery(string UserId) : IRequest<IEnumerable<ShareDto>>;

public class GetSharedByMeQueryHandler : IRequestHandler<GetSharedByMeQuery, IEnumerable<ShareDto>>
{
    private readonly IShareRepository _shareRepository;

    public GetSharedByMeQueryHandler(IShareRepository shareRepository)
    {
        _shareRepository = shareRepository;
    }

    public async Task<IEnumerable<ShareDto>> Handle(GetSharedByMeQuery request, CancellationToken cancellationToken)
    {
        var shares = await _shareRepository.GetSharedByMeAsync(request.UserId);

        return shares.Select(s => new ShareDto
        {
            Id             = s.Id,
            SenderUserId   = s.SenderUserId,
            ReceiverUserId = s.ReceiverUserId,
            MediaItemId    = s.MediaItemId,
            PlaylistId     = s.PlaylistId,
            Message        = s.Message,
            SharedAt       = s.SharedAt
        });
    }
}