using TuneVault.Domain.Entities;

namespace TuneVault.Application.Interfaces;

public interface IShareRepository
{
    Task AddAsync(Share share);
    Task<bool> ExistsShareAsync(string senderUserId, string receiverUserId, Guid? mediaItemId, Guid? playlistId);
    Task<IEnumerable<Share>> GetSharedWithMeAsync(string userId);
    Task<IEnumerable<Share>> GetSharedByMeAsync(string userId);
}