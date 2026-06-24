using TuneVault.Domain.Entities;

namespace TuneVault.Domain.Interfaces;

public interface IAlbumRepository
{
    Task<Album?> GetByIdAsync(int id);
    Task<IEnumerable<Album>> GetAllAsync();
    Task<Album> CreateAsync(Album album);
    Task<Album> UpdateAsync(Album album);
    Task<bool> DeleteAsync(int id, string ownerUserId);
    Task<IEnumerable<Album>> SearchAsync(string query);
}
