using Microsoft.EntityFrameworkCore;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;
using TuneVault.Infrastructure.Helpers;
using TuneVault.Infrastructure.Persistence;

namespace TuneVault.Infrastructure.Repositories;

public sealed class MediaRepository : IMediaRepository
{
    private readonly ApplicationDbContext _db;
    public MediaRepository(ApplicationDbContext db) => _db = db;

    public async Task<MediaItem?> GetByIdAsync(long id) =>
        await _db.MediaItems.Include(x => x.Artist).Include(x => x.Album).FirstOrDefaultAsync(x => x.MediaItemId == id);

    public async Task<IEnumerable<MediaItem>> GetAllAsync() =>
        await _db.MediaItems.Include(x => x.Artist).Include(x => x.Album).ToListAsync();

    public async Task<MediaItem> CreateAsync(MediaItem media)
    {
        _db.MediaItems.Add(media);
        await _db.SaveChangesAsync();
        // Load navigations
        await _db.Entry(media).Reference(x => x.Artist).LoadAsync();
        if (media.AlbumId.HasValue) await _db.Entry(media).Reference(x => x.Album).LoadAsync();
        return media;
    }

    public async Task<MediaItem> UpdateAsync(MediaItem media)
    {
        _db.MediaItems.Update(media);
        await _db.SaveChangesAsync();
        return media;
    }

    public async Task<bool> DeleteAsync(long id, string ownerUserId)
    {
        var media = await _db.MediaItems.FindAsync(id);
        if (media is null || media.OwnerUserId != ownerUserId) return false;
        _db.MediaItems.Remove(media);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<MediaItem>> SearchAsync(string query)
    {
        var all = await _db.MediaItems.Include(x => x.Artist).Include(x => x.Album).ToListAsync();
        if (string.IsNullOrEmpty(query)) return all;
        return all.Where(m => StringExtensions.FuzzyMatch(query, m.Title, m.ArtistName, m.AlbumTitle));
    }

    public async Task<IEnumerable<MediaItem>> GetTrendingAsync(int count) =>
        await _db.MediaItems.Include(x => x.Artist).Include(x => x.Album).OrderByDescending(x => x.PlayCount).Take(count).ToListAsync();

    public async Task<IEnumerable<MediaItem>> GetByAlbumIdAsync(int albumId) =>
        await _db.MediaItems.Include(x => x.Artist).Include(x => x.Album).Where(m => m.AlbumId == albumId).ToListAsync();
}
