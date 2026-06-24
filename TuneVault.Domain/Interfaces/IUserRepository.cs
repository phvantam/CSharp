using TuneVault.Domain.Entities;

namespace TuneVault.Domain.Interfaces;

public interface IUserRepository
{
    Task<AppUser?> GetByIdAsync(string id);
    Task<AppUser?> GetByEmailAsync(string email);
    Task<AppUser> CreateAsync(AppUser user);
    Task<AppUser> UpdateAsync(AppUser user);
    Task<IEnumerable<AppUser>> SearchAsync(string query);
}
