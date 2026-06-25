using TuneVault.Domain.Entities;

namespace TuneVault.Domain.Interfaces;

public interface IPlayHistoryRepository
{
    Task RecordAsync(string userId, long mediaItemId);
    Task<IEnumerable<MediaItem>> GetRecentAsync(string userId, int count = 10);
}
