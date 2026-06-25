using MediatR;
using TuneVault.Application.DTOs.Media;

namespace TuneVault.Application.Features.PlayHistory.Queries.GetPlayHistory;

public record GetPlayHistoryQuery(string UserId, int Limit = 20) : IRequest<List<MediaItemDto>>;