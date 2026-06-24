using Microsoft.EntityFrameworkCore;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;
using TuneVault.Infrastructure.Helpers;
using TuneVault.Infrastructure.Persistence;

namespace TuneVault.Infrastructure.Repositories;

public sealed class AlbumRepository : IAlbumRepository
{
    private readonly ApplicationDbContext _db;
    public AlbumRepository(ApplicationDbContext db) => _db = db;

    public async Task<Album?> GetByIdAsync(int id) => await _db.Albums.FindAsync(id);
    public async Task<IEnumerable<Album>> GetAllAsync() => await _db.Albums.ToListAsync();

    public async Task<Album> CreateAsync(Album album)
    {
        _db.Albums.Add(album);
        await _db.SaveChangesAsync();
        return album;
    }

    public async Task<Album> UpdateAsync(Album album)
    {
        _db.Albums.Update(album);
        await _db.SaveChangesAsync();
        return album;
    }

    public async Task<bool> DeleteAsync(int id, string ownerUserId)
    {
        var album = await _db.Albums.FindAsync(id);
        if (album is null || album.OwnerUserId != ownerUserId) return false;
        // Remove album references from media items
        var mediaItems = await _db.MediaItems.Where(m => m.AlbumId == id).ToListAsync();
        foreach (var m in mediaItems) { m.AlbumId = null; }
        _db.Albums.Remove(album);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Album>> SearchAsync(string query)
    {
        var all = await _db.Albums.ToListAsync();
        if (string.IsNullOrEmpty(query)) return Enumerable.Empty<Album>();
        return all.Where(a => StringExtensions.FuzzyMatch(query, a.Title, a.ArtistName, a.Description));
    }
}
