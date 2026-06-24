using TuneVault.Domain.Entities;

namespace TuneVault.Domain.Interfaces;

public interface IMediaRepository
{
    Task<MediaItem?> GetByIdAsync(long id);
    Task<IEnumerable<MediaItem>> GetAllAsync();
    Task<MediaItem> CreateAsync(MediaItem media);
    Task<MediaItem> UpdateAsync(MediaItem media);
    Task<bool> DeleteAsync(long id, string ownerUserId);
    Task<IEnumerable<MediaItem>> SearchAsync(string query);
    Task<IEnumerable<MediaItem>> GetTrendingAsync(int count);
    Task<IEnumerable<MediaItem>> GetByAlbumIdAsync(int albumId);
}
