using TuneVault.Domain.Entities;

namespace TuneVault.Domain.Interfaces;

public interface IFavoriteRepository
{
    Task<bool> ToggleAsync(string userId, long mediaItemId);
    Task<IEnumerable<MediaItem>> GetFavoritesAsync(string userId);
    Task<bool> IsFavoritedAsync(string userId, long mediaItemId);
}
