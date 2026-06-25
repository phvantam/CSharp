using MediatR;
using TuneVault.Application.DTOs.Share;

namespace TuneVault.Application.Features.Share.Queries.GetSentShares;

public record GetSentSharesQuery(string UserId) : IRequest<List<ShareInboxDto>>;