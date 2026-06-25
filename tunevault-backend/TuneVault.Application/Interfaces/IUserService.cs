using TuneVault.Application.DTOs.User;

namespace TuneVault.Application.Interfaces;

public interface IUserService
{
    Task<UserProfileDto?> GetUserProfileAsync(string userId);
    Task<bool> UpdateUserProfileAsync(string userId, UpdateProfileRequestDto request);

    Task<PublicUserProfileDto?> GetPublicProfileAsync(string targetUserId, string? currentUserId);
    Task<FollowStatsDto> GetFollowStatsAsync(string targetUserId, string? currentUserId);
    Task<bool> IsFollowingAsync(string followerId, string targetUserId);
    Task<List<UserListItemDto>> GetFollowersAsync(string targetUserId, string? currentUserId);
    Task<List<UserListItemDto>> GetFollowingAsync(string targetUserId, string? currentUserId);

    Task<bool> FollowUserAsync(string followerId, string followingId);
    Task<bool> UnfollowUserAsync(string followerId, string followingId);
}
