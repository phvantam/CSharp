using MediatR;
using TuneVault.Application.DTOs.Media;

namespace TuneVault.Application.Features.Media.Queries.GetNewReleases;

public record GetNewReleasesQuery(int Limit = 12) : IRequest<List<MediaItemDto>>;