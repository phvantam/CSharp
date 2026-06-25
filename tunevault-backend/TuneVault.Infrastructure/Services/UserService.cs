using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TuneVault.Application.DTOs.User;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;
using TuneVault.Infrastructure.Persistence;

namespace TuneVault.Infrastructure.Services;

public class UserService : IUserService
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly INotificationService _notificationService;

    public UserService(
        ApplicationDbContext context,
        UserManager<ApplicationUser> userManager,
        INotificationService notificationService)
    {
        _context = context;
        _userManager = userManager;
        _notificationService = notificationService;
    }

    public async Task<UserProfileDto?> GetUserProfileAsync(string userId)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return null;

        var profile = await _context.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId);

        var displayName = profile?.FullName ?? user.DisplayName ?? user.UserName ?? "";

        return new UserProfileDto
        {
            UserId = userId,
            DisplayName = displayName,
            FullName = displayName,
            Email = user.Email,
            Bio = profile?.Bio ?? user.Bio,
            AvatarUrl = profile?.AvatarUrl ?? user.AvatarUrl,
            PrivacyLevel = profile?.PrivacyLevel ?? "Public",
            CreatedAt = user.CreatedAt
        };
    }

    public async Task<bool> UpdateUserProfileAsync(string userId, UpdateProfileRequestDto request)
    {
        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return false;

        if (!string.IsNullOrWhiteSpace(request.FullName))
        {
            user.DisplayName = request.FullName.Trim();
        }

        if (request.Bio != null)
        {
            user.Bio = request.Bio;
        }

        if (request.AvatarUrl != null)
        {
            user.AvatarUrl = request.AvatarUrl;
        }

        user.UpdatedAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        var profile = await _context.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile == null)
        {
            profile = new UserProfile
            {
                UserId = userId,
                FullName = !string.IsNullOrWhiteSpace(request.FullName)
                    ? request.FullName.Trim()
                    : user.DisplayName,
                Bio = request.Bio,
                AvatarUrl = request.AvatarUrl,
                PrivacyLevel = string.IsNullOrWhiteSpace(request.PrivacyLevel)
                    ? "Public"
                    : request.PrivacyLevel,
                CreatedAt = DateTime.UtcNow
            };

            _context.UserProfiles.Add(profile);
        }
        else
        {
            if (!string.IsNullOrWhiteSpace(request.FullName))
                profile.FullName = request.FullName.Trim();

            if (request.Bio != null)
                profile.Bio = request.Bio;

            if (request.AvatarUrl != null)
                profile.AvatarUrl = request.AvatarUrl;

            if (!string.IsNullOrWhiteSpace(request.PrivacyLevel))
                profile.PrivacyLevel = request.PrivacyLevel;

            profile.UpdatedAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<PublicUserProfileDto?> GetPublicProfileAsync(
        string targetUserId,
        string? currentUserId)
    {
        var user = await _userManager.FindByIdAsync(targetUserId);
        if (user == null) return null;

        var profile = await _context.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == targetUserId);

        var stats = await GetFollowStatsAsync(targetUserId, currentUserId);

        return new PublicUserProfileDto
        {
            UserId = user.Id,
            DisplayName = user.DisplayName ?? user.UserName ?? "Unknown User",
            Email = user.Email,
            AvatarUrl = profile?.AvatarUrl ?? user.AvatarUrl,
            Bio = profile?.Bio ?? user.Bio,
            PrivacyLevel = profile?.PrivacyLevel ?? "Public",
            CreatedAt = user.CreatedAt,
            FollowerCount = stats.FollowerCount,
            FollowingCount = stats.FollowingCount,
            IsFollowing = stats.IsFollowing
        };
    }

    public async Task<FollowStatsDto> GetFollowStatsAsync(
        string targetUserId,
        string? currentUserId)
    {
        var followerCount = await _context.Follows
            .CountAsync(f => f.TargetUserId == targetUserId);

        var followingCount = await _context.Follows
            .CountAsync(f => f.FollowerUserId == targetUserId && f.TargetUserId != null);

        var isFollowing = false;

        if (!string.IsNullOrWhiteSpace(currentUserId) && currentUserId != targetUserId)
        {
            isFollowing = await _context.Follows.AnyAsync(f =>
                f.FollowerUserId == currentUserId &&
                f.TargetUserId == targetUserId);
        }

        return new FollowStatsDto
        {
            FollowerCount = followerCount,
            FollowingCount = followingCount,
            IsFollowing = isFollowing
        };
    }

    public async Task<bool> IsFollowingAsync(string followerId, string targetUserId)
    {
        if (string.IsNullOrWhiteSpace(followerId) ||
            string.IsNullOrWhiteSpace(targetUserId) ||
            followerId == targetUserId)
        {
            return false;
        }

        return await _context.Follows.AnyAsync(f =>
            f.FollowerUserId == followerId &&
            f.TargetUserId == targetUserId);
    }

    public async Task<List<UserListItemDto>> GetFollowersAsync(
        string targetUserId,
        string? currentUserId)
    {
        var followingIds = new HashSet<string>();

        if (!string.IsNullOrWhiteSpace(currentUserId))
        {
            followingIds = await _context.Follows
                .Where(f => f.FollowerUserId == currentUserId && f.TargetUserId != null)
                .Select(f => f.TargetUserId!)
                .ToHashSetAsync();
        }

        var users = await _context.Follows
            .Where(f => f.TargetUserId == targetUserId)
            .Include(f => f.Follower)
            .Select(f => f.Follower)
            .ToListAsync();

        return users.Select(u => new UserListItemDto
        {
            UserId = u.Id,
            DisplayName = u.DisplayName ?? u.UserName ?? "Unknown User",
            Email = u.Email,
            AvatarUrl = u.AvatarUrl,
            Bio = u.Bio,
            IsFollowing = followingIds.Contains(u.Id)
        }).ToList();
    }

    public async Task<List<UserListItemDto>> GetFollowingAsync(
        string targetUserId,
        string? currentUserId)
    {
        var followingIds = new HashSet<string>();

        if (!string.IsNullOrWhiteSpace(currentUserId))
        {
            followingIds = await _context.Follows
                .Where(f => f.FollowerUserId == currentUserId && f.TargetUserId != null)
                .Select(f => f.TargetUserId!)
                .ToHashSetAsync();
        }

        var users = await _context.Follows
            .Where(f => f.FollowerUserId == targetUserId && f.TargetUserId != null)
            .Include(f => f.TargetUser)
            .Select(f => f.TargetUser!)
            .ToListAsync();

        return users.Select(u => new UserListItemDto
        {
            UserId = u.Id,
            DisplayName = u.DisplayName ?? u.UserName ?? "Unknown User",
            Email = u.Email,
            AvatarUrl = u.AvatarUrl,
            Bio = u.Bio,
            IsFollowing = followingIds.Contains(u.Id)
        }).ToList();
    }

    public async Task<bool> FollowUserAsync(string followerId, string followingId)
    {
        if (string.IsNullOrWhiteSpace(followerId) ||
            string.IsNullOrWhiteSpace(followingId) ||
            followerId == followingId)
        {
            return false;
        }

        var targetUserExists = await _userManager.Users.AnyAsync(u => u.Id == followingId);
        if (!targetUserExists) return false;

        var exists = await _context.Follows
            .AnyAsync(f => f.FollowerUserId == followerId && f.TargetUserId == followingId);

        if (exists) return true;

        var follow = new Follow
        {
            FollowerUserId = followerId,
            TargetUserId = followingId,
            TargetArtistId = null,
            CreatedAt = DateTime.UtcNow
        };

        await _context.Follows.AddAsync(follow);
        await _context.SaveChangesAsync();

        var follower = await _userManager.FindByIdAsync(followerId);
        var followerName = GetDisplayName(follower);

        await _notificationService.SendNotificationAsync(
            userId: followingId,
            title: $"{followerName} đã theo dõi bạn",
            message: "Nhấn để xem hồ sơ người dùng này.",
            type: "Follow",
            referenceId: null,
            senderUserId: followerId,
            actionUrl: $"/profile/{followerId}"
        );

        return true;
    }

    public async Task<bool> UnfollowUserAsync(string followerId, string followingId)
    {
        var follow = await _context.Follows
            .FirstOrDefaultAsync(f =>
                f.FollowerUserId == followerId &&
                f.TargetUserId == followingId);

        if (follow == null) return false;

        _context.Follows.Remove(follow);
        await _context.SaveChangesAsync();

        return true;
    }

    private static string GetDisplayName(ApplicationUser? user)
    {
        if (user == null)
            return "Unknown User";

        if (!string.IsNullOrWhiteSpace(user.DisplayName))
            return user.DisplayName;

        if (!string.IsNullOrWhiteSpace(user.UserName))
            return user.UserName;

        if (!string.IsNullOrWhiteSpace(user.Email))
            return user.Email;

        return "Unknown User";
    }
}
