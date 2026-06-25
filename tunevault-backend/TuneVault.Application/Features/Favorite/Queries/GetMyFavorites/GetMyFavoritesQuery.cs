using MediatR;
using TuneVault.Application.DTOs.Media;

namespace TuneVault.Application.Features.Favorite.Queries.GetMyFavorites;

public record GetMyFavoritesQuery(string UserId) : IRequest<List<MediaItemDto>>;