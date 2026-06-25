using TuneVault.Application.DTOs.Media;

namespace TuneVault.Application.Interfaces;

public interface IFavoriteService
{
    Task<bool> AddToFavoriteAsync(string userId, long mediaItemId);
    Task<bool> RemoveFromFavoriteAsync(string userId, long mediaItemId);
    Task<List<MediaItemDto>> GetMyFavoritesAsync(string userId);
}
