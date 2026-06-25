using TuneVault.Domain.Entities;

namespace TuneVault.Domain.Interfaces;

public interface IPlaylistRepository
{
    Task<Playlist?> GetByIdAsync(long id);
    Task<IEnumerable<Playlist>> GetByUserIdAsync(string userId);
    Task<Playlist> CreateAsync(Playlist playlist);
    Task<Playlist> UpdateAsync(Playlist playlist);
    Task<bool> DeleteAsync(long id, string ownerUserId);
    Task<bool> AddTrackAsync(long playlistId, long mediaItemId, string ownerUserId);
    Task<bool> RemoveTrackAsync(long playlistId, long mediaItemId, string ownerUserId);
    Task<IEnumerable<Playlist>> SearchAsync(string query, string? currentUserId);
}
