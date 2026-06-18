using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IPlaylistRepository
{
    Task<IEnumerable<Playlist>> GetByOwnerAsync(string ownerId);
    Task<Playlist?> GetByIdAsync(Guid id);
    Task AddAsync(Playlist playlist);
    Task UpdateAsync(Playlist playlist);
    Task DeleteAsync(Guid id);
}