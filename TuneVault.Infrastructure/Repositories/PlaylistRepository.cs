using Microsoft.EntityFrameworkCore;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;
using TuneVault.Infrastructure.Helpers;
using TuneVault.Infrastructure.Persistence;

namespace TuneVault.Infrastructure.Repositories;

public sealed class PlaylistRepository : IPlaylistRepository
{
    private readonly ApplicationDbContext _db;
    public PlaylistRepository(ApplicationDbContext db) => _db = db;

    public async Task<Playlist?> GetByIdAsync(long id) =>
        await _db.Playlists.Include(p => p.Tracks).ThenInclude(t => t.MediaItem).ThenInclude(m => m.Artist).FirstOrDefaultAsync(p => p.PlaylistId == id);

    public async Task<IEnumerable<Playlist>> GetByUserIdAsync(string userId) =>
        await _db.Playlists.Where(p => p.OwnerUserId == userId).ToListAsync();

    public async Task<Playlist> CreateAsync(Playlist playlist)
    {
        _db.Playlists.Add(playlist);
        await _db.SaveChangesAsync();
        return playlist;
    }

    public async Task<Playlist> UpdateAsync(Playlist playlist)
    {
        _db.Playlists.Update(playlist);
        await _db.SaveChangesAsync();
        return playlist;
    }

    public async Task<bool> DeleteAsync(long id, string ownerUserId)
    {
        var playlist = await _db.Playlists.FindAsync(id);
        if (playlist is null || playlist.OwnerUserId != ownerUserId) return false;
        _db.Playlists.Remove(playlist);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> AddTrackAsync(long playlistId, long mediaItemId, string ownerUserId)
    {
        var playlist = await _db.Playlists.FindAsync(playlistId);
        if (playlist is null || playlist.OwnerUserId != ownerUserId) return false;
        _db.PlaylistTracks.Add(new PlaylistTrack
        {
            PlaylistId = playlistId,
            MediaItemId = mediaItemId,
            AddedByUserId = ownerUserId,
            AddedAt = DateTime.UtcNow
        });
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RemoveTrackAsync(long playlistId, long mediaItemId, string ownerUserId)
    {
        var playlist = await _db.Playlists.FindAsync(playlistId);
        if (playlist is null || playlist.OwnerUserId != ownerUserId) return false;
        var track = await _db.PlaylistTracks.FirstOrDefaultAsync(t => t.PlaylistId == playlistId && t.MediaItemId == mediaItemId);
        if (track is null) return false;
        _db.PlaylistTracks.Remove(track);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<Playlist>> SearchAsync(string query, string? currentUserId)
    {
        var playlists = await _db.Playlists.Include(p => p.Tracks).ToListAsync();
        if (string.IsNullOrEmpty(query)) return Enumerable.Empty<Playlist>();
        return playlists.Where(p => StringExtensions.FuzzyMatch(query, p.Title) &&
            (p.Visibility.Equals("Public", StringComparison.OrdinalIgnoreCase) || p.OwnerUserId == currentUserId));
    }
}
