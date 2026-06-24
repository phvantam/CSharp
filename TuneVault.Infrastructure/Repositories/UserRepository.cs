using Microsoft.EntityFrameworkCore;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;
using TuneVault.Infrastructure.Helpers;
using TuneVault.Infrastructure.Persistence;

namespace TuneVault.Infrastructure.Repositories;

public sealed class UserRepository : IUserRepository
{
    private readonly ApplicationDbContext _db;
    public UserRepository(ApplicationDbContext db) => _db = db;

    public async Task<AppUser?> GetByIdAsync(string id) =>
        await _db.Users.FindAsync(id);

    public async Task<AppUser?> GetByEmailAsync(string email) =>
        await _db.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == email.ToLower());

    public async Task<AppUser> CreateAsync(AppUser user)
    {
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return user;
    }

    public async Task<AppUser> UpdateAsync(AppUser user)
    {
        _db.Users.Update(user);
        await _db.SaveChangesAsync();
        return user;
    }

    public async Task<IEnumerable<AppUser>> SearchAsync(string query)
    {
        var users = await _db.Users.ToListAsync();
        if (string.IsNullOrEmpty(query)) return users;
        return users.Where(u => StringExtensions.FuzzyMatch(query, u.DisplayName, u.Email));
    }
}
