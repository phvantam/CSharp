using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(string userId);
    Task<User?> GetByEmailAsync(string email); // Cần cho việc check trùng email khi đăng ký và đăng nhập
    Task AddAsync(User user); // Bổ sung dòng này để hết lỗi đỏ ở RegisterCommand
    Task UpdateAsync(User user);
}