using Microsoft.EntityFrameworkCore;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;
using TuneVault.Infrastructure.Persistence;

namespace TuneVault.Infrastructure.Repositories;

public sealed class FollowRepository : IFollowRepository
{
    private readonly ApplicationDbContext _db;
    public FollowRepository(ApplicationDbContext db) => _db = db;

    public async Task<bool> FollowAsync(string followerUserId, string targetUserId)
    {
        var exists = await _db.Follows.AnyAsync(f => f.FollowerUserId == followerUserId && f.FollowingUserId == targetUserId);
        if (exists) return false;
        _db.Follows.Add(new Follow { FollowerUserId = followerUserId, FollowingUserId = targetUserId, CreatedAt = DateTime.UtcNow });
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UnfollowAsync(string followerUserId, string targetUserId)
    {
        var follow = await _db.Follows.FirstOrDefaultAsync(f => f.FollowerUserId == followerUserId && f.FollowingUserId == targetUserId);
        if (follow is null) return false;
        _db.Follows.Remove(follow);
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<IEnumerable<AppUser>> GetFollowersAsync(string userId) =>
        await _db.Follows.Where(f => f.FollowingUserId == userId).Join(_db.Users, f => f.FollowerUserId, u => u.Id, (f, u) => u).ToListAsync();

    public async Task<IEnumerable<AppUser>> GetFollowingAsync(string userId) =>
        await _db.Follows.Where(f => f.FollowerUserId == userId).Join(_db.Users, f => f.FollowingUserId, u => u.Id, (f, u) => u).ToListAsync();

    public async Task<bool> IsFollowingAsync(string followerUserId, string targetUserId) =>
        await _db.Follows.AnyAsync(f => f.FollowerUserId == followerUserId && f.FollowingUserId == targetUserId);
}
