using Microsoft.EntityFrameworkCore;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;
using TuneVault.Infrastructure.Persistence;

namespace TuneVault.Infrastructure.Repositories;

public sealed class PlayHistoryRepository : IPlayHistoryRepository
{
    private readonly ApplicationDbContext _db;
    public PlayHistoryRepository(ApplicationDbContext db) => _db = db;

    public async Task RecordAsync(string userId, long mediaItemId)
    {
        _db.PlayHistories.Add(new PlayHistory
        {
            UserId = userId,
            MediaItemId = mediaItemId,
            PlayedAt = DateTime.UtcNow
        });
        // Increment play count
        var media = await _db.MediaItems.FindAsync(mediaItemId);
        if (media is not null) media.PlayCount++;
        await _db.SaveChangesAsync();
    }

    public async Task<IEnumerable<MediaItem>> GetRecentAsync(string userId, int count = 10)
    {
        var recentMediaIds = await _db.PlayHistories
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.LastPlayedAt)
            .Select(p => p.MediaItemId)
            .Distinct()
            .Take(count)
            .ToListAsync();

        var mediaItems = await _db.MediaItems
            .Include(x => x.Artist)
            .Include(x => x.Album)
            .Where(m => recentMediaIds.Contains(m.MediaItemId))
            .ToListAsync();

        return recentMediaIds
            .Select(id => mediaItems.FirstOrDefault(m => m.MediaItemId == id))
            .Where(m => m != null)
            .Cast<MediaItem>();
    }
}
