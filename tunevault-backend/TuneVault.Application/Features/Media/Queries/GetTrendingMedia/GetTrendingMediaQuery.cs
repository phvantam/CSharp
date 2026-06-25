using MediatR;
using TuneVault.Application.DTOs.Media;

namespace TuneVault.Application.Features.Media.Queries.GetTrendingMedia;

public record GetTrendingMediaQuery(int Limit = 12) : IRequest<List<MediaItemDto>>;