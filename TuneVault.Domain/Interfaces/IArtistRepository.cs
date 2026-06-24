using TuneVault.Domain.Entities;

namespace TuneVault.Domain.Interfaces;

public interface IArtistRepository
{
    Task<Artist?> GetByNameAsync(string name);
    Task<Artist> CreateAsync(Artist artist);
}
