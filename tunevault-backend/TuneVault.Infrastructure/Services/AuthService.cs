using Microsoft.AspNetCore.Identity;
using TuneVault.Application.DTOs.Auth;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;
using TuneVault.Infrastructure.Persistence;

namespace TuneVault.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly JwtTokenService _jwtTokenService;
    private readonly ApplicationDbContext _context;

    public AuthService(
        UserManager<ApplicationUser> userManager,
        JwtTokenService jwtTokenService,
        ApplicationDbContext context)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
        _context = context;
    }

    public async Task<AuthResponseDto?> RegisterAsync(RegisterDto dto)
    {
        var userExists = await _userManager.FindByEmailAsync(dto.Email);
        if (userExists != null) return null;

        var user = new ApplicationUser
        {
            UserName = dto.Username,
            Email = dto.Email,
            DisplayName = dto.DisplayName,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var result = await _userManager.CreateAsync(user, dto.Password);
        if (!result.Succeeded) return null;

        // ==================== TỰ ĐỘNG TẠO USER PROFILE (có try-catch) ====================
        try
        {
            var userProfile = new UserProfile
            {
                UserId = user.Id,
                FullName = dto.DisplayName,
                PrivacyLevel = "Public",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.UserProfiles.Add(userProfile);
            await _context.SaveChangesAsync();

            Console.WriteLine(">>> [AuthService] UserProfile đã được tạo thành công!");
        }
        catch (Exception ex)
        {
            Console.WriteLine(">>> [AuthService] LỖI KHI TẠO USERPROFILE:");
            Console.WriteLine(ex.ToString());
        }
        // =======================================================================

        var token = _jwtTokenService.GenerateToken(user);

        return new AuthResponseDto
        {
            Token = token,
            Username = user.UserName ?? "",
            Email = user.Email ?? ""
        };
    }

public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
{
    // Tìm user bằng Email hoặc Username
    var user = await _userManager.FindByEmailAsync(dto.LoginIdentifier)
            ?? await _userManager.FindByNameAsync(dto.LoginIdentifier);

    if (user == null)
        return null;

    var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
    if (!isPasswordValid)
        return null;

    var token = _jwtTokenService.GenerateToken(user);

    return new AuthResponseDto
    {
        Token = token,
        Username = user.UserName ?? "",
        Email = user.Email ?? "",
        DisplayName = user.DisplayName ?? ""
    };
}
}