using MediatR;
using TuneVault.Application.DTOs.Share;

namespace TuneVault.Application.Features.Share.Queries.GetReceivedShares;

public record GetReceivedSharesQuery(string UserId) : IRequest<List<ShareInboxDto>>;