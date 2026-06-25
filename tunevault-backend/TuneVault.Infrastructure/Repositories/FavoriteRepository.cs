using Microsoft.EntityFrameworkCore;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;
using TuneVault.Infrastructure.Persistence;

namespace TuneVault.Infrastructure.Repositories;

public sealed class FavoriteRepository : IFavoriteRepository
{
    private readonly ApplicationDbContext _db;
    public FavoriteRepository(ApplicationDbContext db) => _db = db;

    public async Task<bool> ToggleAsync(string userId, long mediaItemId)
    {
        var existing = await _db.Favorites.FirstOrDefaultAsync(f => f.UserId == userId && f.MediaItemId == mediaItemId);
        if (existing is not null)
        {
            _db.Favorites.Remove(existing);
            await _db.SaveChangesAsync();
            return false;
        }
        _db.Favorites.Add(new Favorite { UserId = userId, MediaItemId = mediaItemId, CreatedAt = DateTime.UtcNow });
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<MediaItem>> GetFavoritesAsync(string userId)
    {
        return await _db.Favorites
            .Where(f => f.UserId == userId)
            .Join(_db.MediaItems.Include(x => x.Artist).Include(x => x.Album), f => f.MediaItemId, m => m.MediaItemId, (f, m) => m)
            .ToListAsync();
    }

    public async Task<bool> IsFavoritedAsync(string userId, long mediaItemId) =>
        await _db.Favorites.AnyAsync(f => f.UserId == userId && f.MediaItemId == mediaItemId);
}
