using MediatR;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Favorite.Queries.GetMyFavorites;

public class GetMyFavoritesQueryHandler : IRequestHandler<GetMyFavoritesQuery, List<MediaItemDto>>
{
    private readonly IFavoriteService _favoriteService;

    public GetMyFavoritesQueryHandler(IFavoriteService favoriteService)
    {
        _favoriteService = favoriteService;
    }

    public async Task<List<MediaItemDto>> Handle(
        GetMyFavoritesQuery query,
        CancellationToken cancellationToken)
    {
        return await _favoriteService.GetMyFavoritesAsync(query.UserId);
    }
}
