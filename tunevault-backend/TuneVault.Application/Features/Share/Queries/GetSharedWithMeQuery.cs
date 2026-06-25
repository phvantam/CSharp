using MediatR;
using TuneVault.Application.Features.Share.DTOs;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Share.Queries;

public record GetSharedWithMeQuery(string UserId) : IRequest<IEnumerable<ShareDto>>;

public class GetSharedWithMeQueryHandler : IRequestHandler<GetSharedWithMeQuery, IEnumerable<ShareDto>>
{
    private readonly IShareRepository _shareRepository;

    public GetSharedWithMeQueryHandler(IShareRepository shareRepository)
    {
        _shareRepository = shareRepository;
    }

    public async Task<IEnumerable<ShareDto>> Handle(GetSharedWithMeQuery request, CancellationToken cancellationToken)
    {
        var shares = await _shareRepository.GetSharedWithMeAsync(request.UserId);

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