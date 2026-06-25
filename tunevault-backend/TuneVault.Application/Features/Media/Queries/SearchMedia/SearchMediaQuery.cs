using MediatR;
using TuneVault.Application.DTOs.Media;

namespace TuneVault.Application.Features.Media.Queries.SearchMedia;

public record SearchMediaQuery(string Keyword, int Page = 1, int PageSize = 20) 
    : IRequest<List<MediaSearchResultDto>>;