using Microsoft.EntityFrameworkCore;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;
using TuneVault.Infrastructure.Persistence;

namespace TuneVault.Infrastructure.Repositories;

public sealed class ArtistRepository : IArtistRepository
{
    private readonly ApplicationDbContext _db;
    public ArtistRepository(ApplicationDbContext db) => _db = db;

    public async Task<Artist?> GetByNameAsync(string name) =>
        await _db.Artists.FirstOrDefaultAsync(a => a.Name.ToLower() == name.ToLower());

    public async Task<Artist> CreateAsync(Artist artist)
    {
        _db.Artists.Add(artist);
        await _db.SaveChangesAsync();
        return artist;
    }
}
