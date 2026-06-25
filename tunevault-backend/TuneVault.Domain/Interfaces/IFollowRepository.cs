using TuneVault.Domain.Entities;

namespace TuneVault.Domain.Interfaces;

public interface IFollowRepository
{
    Task<bool> FollowAsync(string followerUserId, string targetUserId);
    Task<bool> UnfollowAsync(string followerUserId, string targetUserId);
    Task<IEnumerable<AppUser>> GetFollowersAsync(string userId);
    Task<IEnumerable<AppUser>> GetFollowingAsync(string userId);
    Task<bool> IsFollowingAsync(string followerUserId, string targetUserId);
}
