using TuneVault.Domain.Entities;

namespace TuneVault.Domain.Interfaces;

public interface IShareRepository
{
    Task<MediaShare> CreateAsync(MediaShare share);
    Task<IEnumerable<MediaShare>> GetSharedWithMeAsync(string userId);
    Task<IEnumerable<MediaShare>> GetSharedByMeAsync(string userId);
}
