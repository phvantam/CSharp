using Microsoft.EntityFrameworkCore;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;
using TuneVault.Infrastructure.Persistence;

namespace TuneVault.Infrastructure.Repositories;

public sealed class ShareRepository : IShareRepository
{
    private readonly ApplicationDbContext _db;
    public ShareRepository(ApplicationDbContext db) => _db = db;

    public async Task<MediaShare> CreateAsync(MediaShare share)
    {
        _db.MediaShares.Add(share);
        await _db.SaveChangesAsync();
        return share;
    }

    public async Task<IEnumerable<MediaShare>> GetSharedWithMeAsync(string userId) =>
        await _db.MediaShares.Where(s => s.ReceiverUserId == userId).OrderByDescending(s => s.CreatedAt).ToListAsync();

    public async Task<IEnumerable<MediaShare>> GetSharedByMeAsync(string userId) =>
        await _db.MediaShares.Where(s => s.SenderUserId == userId).OrderByDescending(s => s.CreatedAt).ToListAsync();
}
