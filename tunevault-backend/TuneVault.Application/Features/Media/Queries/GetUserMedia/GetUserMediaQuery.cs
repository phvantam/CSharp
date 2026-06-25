using MediatR;
using TuneVault.Application.DTOs.Media;

namespace TuneVault.Application.Features.Media.Queries.GetUserMedia;

public record GetUserMediaQuery(string UserId, int Page = 1, int PageSize = 20) 
    : IRequest<List<MediaItemDto>>;
    