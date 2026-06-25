using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TuneVault.Domain.Entities;
using MediatR;
using TuneVault.Application.Common;
using TuneVault.Application.DTOs.User;
using TuneVault.Application.Interfaces;
using TuneVault.Infrastructure.Persistence;
using TuneVault.Application.Features.User.Queries.GetUserProfile;
using TuneVault.Application.Features.User.Commands.UpdateUserProfile;
using TuneVault.Application.Features.User.Commands.FollowUser;
using TuneVault.Application.Features.User.Commands.UnfollowUser;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/user")]
[Authorize]
public class UserController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly IUserService _userService;
    private readonly IWebHostEnvironment _environment;
    private readonly ApplicationDbContext _context;

    public UserController(
        IMediator mediator,
        UserManager<ApplicationUser> userManager,
        IUserService userService,
        IWebHostEnvironment environment,
        ApplicationDbContext context)
    {
        _mediator = mediator;
        _userManager = userManager;
        _userService = userService;
        _environment = environment;
        _context = context;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var profile = await _mediator.Send(new GetUserProfileQuery(userId));
        return Ok(ApiResponse<UserProfileDto?>.SuccessResponse(profile));
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequestDto request)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var success = await _mediator.Send(new UpdateUserProfileCommand(userId, request));
        return Ok(ApiResponse<bool>.SuccessResponse(success, "Cập nhật profile thành công"));
    }

    // ==================== PUBLIC PROFILE ====================
    [HttpGet("{id}/profile")]
    public async Task<IActionResult> GetPublicProfile(string id)
    {
        var currentUserId = GetCurrentUserId();

        var profile = await _userService.GetPublicProfileAsync(id, currentUserId);
        if (profile == null)
            return NotFound(ApiResponse<object>.ErrorResponse("Không tìm thấy người dùng"));

        return Ok(ApiResponse<PublicUserProfileDto>.SuccessResponse(profile));
    }

    [HttpGet("{id}/follow-stats")]
    public async Task<IActionResult> GetFollowStats(string id)
    {
        var currentUserId = GetCurrentUserId();
        var stats = await _userService.GetFollowStatsAsync(id, currentUserId);
        return Ok(ApiResponse<FollowStatsDto>.SuccessResponse(stats));
    }

    [HttpGet("{id}/followers")]
    public async Task<IActionResult> GetFollowers(string id)
    {
        var currentUserId = GetCurrentUserId();
        var users = await _userService.GetFollowersAsync(id, currentUserId);
        return Ok(ApiResponse<List<UserListItemDto>>.SuccessResponse(users));
    }

    [HttpGet("{id}/following")]
    public async Task<IActionResult> GetFollowing(string id)
    {
        var currentUserId = GetCurrentUserId();
        var users = await _userService.GetFollowingAsync(id, currentUserId);
        return Ok(ApiResponse<List<UserListItemDto>>.SuccessResponse(users));
    }

    [HttpPost("avatar")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> UploadAvatar(IFormFile avatar)
    {
        var userId = GetCurrentUserId();
        if (string.IsNullOrWhiteSpace(userId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        if (avatar == null || avatar.Length == 0)
            return BadRequest(ApiResponse<object>.ErrorResponse("Vui lòng chọn ảnh đại diện"));

        if (!avatar.ContentType.StartsWith("image/"))
            return BadRequest(ApiResponse<object>.ErrorResponse("File tải lên phải là ảnh"));

        if (avatar.Length > 5 * 1024 * 1024)
            return BadRequest(ApiResponse<object>.ErrorResponse("Ảnh đại diện tối đa 5MB"));

        var webRoot = _environment.WebRootPath;
        if (string.IsNullOrWhiteSpace(webRoot))
        {
            webRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        }

        var folder = Path.Combine(webRoot, "media", "avatar");
        Directory.CreateDirectory(folder);

        var ext = Path.GetExtension(avatar.FileName);
        if (string.IsNullOrWhiteSpace(ext))
            ext = ".jpg";

        var fileName = $"{Guid.NewGuid():N}{ext}";
        var filePath = Path.Combine(folder, fileName);

        await using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await avatar.CopyToAsync(stream);
        }

        var avatarUrl = $"/media/avatar/{fileName}";

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null)
            return NotFound(ApiResponse<object>.ErrorResponse("Không tìm thấy người dùng"));

        user.AvatarUrl = avatarUrl;
        user.UpdatedAt = DateTime.UtcNow;
        await _userManager.UpdateAsync(user);

        var profile = await _context.UserProfiles
            .FirstOrDefaultAsync(p => p.UserId == userId);

        if (profile != null)
        {
            profile.AvatarUrl = avatarUrl;
            profile.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();
        }

        return Ok(ApiResponse<object>.SuccessResponse(new
        {
            avatarUrl
        }, "Cập nhật ảnh đại diện thành công"));
    }

    // ==================== FOLLOW / UNFOLLOW ====================
    [HttpPost("{id}/follow")]
    public async Task<IActionResult> Follow(string id)
    {
        var followerId = GetCurrentUserId();
        if (string.IsNullOrEmpty(followerId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var success = await _mediator.Send(new FollowUserCommand(followerId, id));

        if (!success)
            return BadRequest(ApiResponse<object>.ErrorResponse("Không thể follow user này"));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Follow thành công"));
    }

    [HttpDelete("{id}/follow")]
    public async Task<IActionResult> Unfollow(string id)
    {
        var followerId = GetCurrentUserId();
        if (string.IsNullOrEmpty(followerId))
            return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

        var success = await _mediator.Send(new UnfollowUserCommand(followerId, id));

        if (!success)
            return NotFound(ApiResponse<object>.ErrorResponse("Bạn chưa follow user này"));

        return Ok(ApiResponse<bool>.SuccessResponse(true, "Unfollow thành công"));
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchUsers([FromQuery] string keyword)
    {
        if (string.IsNullOrWhiteSpace(keyword) || keyword.Trim().Length < 2)
        {
            return Ok(ApiResponse<List<UserSearchResultDto>>.SuccessResponse(
                new List<UserSearchResultDto>()
            ));
        }

        keyword = keyword.Trim();

        var currentUserId = GetCurrentUserId();

        var users = await _userManager.Users
            .Where(u =>
                u.Id != currentUserId &&
                (
                    (u.UserName != null && u.UserName.Contains(keyword)) ||
                    (u.Email != null && u.Email.Contains(keyword)) ||
                    (u.DisplayName != null && u.DisplayName.Contains(keyword))
                )
            )
            .Take(10)
            .Select(u => new UserSearchResultDto
            {
                Id = u.Id,
                Name = !string.IsNullOrWhiteSpace(u.DisplayName)
                    ? u.DisplayName
                    : u.UserName ?? "Unknown User",
                Username = u.UserName,
                Email = u.Email,
                AvatarUrl = u.AvatarUrl
            })
            .ToListAsync();

        if (!string.IsNullOrWhiteSpace(currentUserId))
        {
            foreach (var user in users)
            {
                user.IsFollowing = await _userService.IsFollowingAsync(currentUserId, user.Id);
            }
        }

        return Ok(ApiResponse<List<UserSearchResultDto>>.SuccessResponse(users));
    }

    private string? GetCurrentUserId()
    {
        return User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    }
}

public class UserSearchResultDto
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Username { get; set; }
    public string? Email { get; set; }
    public string? AvatarUrl { get; set; }
    public bool IsFollowing { get; set; }
}
