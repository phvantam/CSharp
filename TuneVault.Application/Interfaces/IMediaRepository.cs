using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IMediaRepository
{
    Task<MediaItem?> GetByIdAsync(Guid id);
    Task<IEnumerable<MediaItem>> GetByOwnerAsync(string ownerId);
    Task AddAsync(MediaItem mediaItem);
    Task<IEnumerable<MediaItem>> GetAllAsync();
    Task DeleteAsync(Guid id);
}