using MediatR;
using TuneVault.Application.DTOs.Media;

namespace TuneVault.Application.Features.Media.Queries.GetMediaById;

public record GetMediaByIdQuery(long MediaItemId) : IRequest<MediaItemDto?>;