using FluentValidation;
using MediatR;
using TuneVault.Application.Common;
using TuneVault.Application.Features.Auth.DTOs;
using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;
using System.Security.Cryptography;
using System.Text;

namespace TuneVault.Application.Features.Auth.Commands;

// --- Register ---
public record RegisterCommand(string Email, string Password, string DisplayName) : IRequest<ApiResponse>;

public sealed class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty().EmailAddress();
        RuleFor(x => x.Password).NotEmpty().MinimumLength(6);
        RuleFor(x => x.DisplayName).NotEmpty();
    }
}

public sealed class RegisterCommandHandler : IRequestHandler<RegisterCommand, ApiResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public RegisterCommandHandler(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<ApiResponse> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        var existing = await _userRepository.GetByEmailAsync(request.Email);
        if (existing is not null)
            return ApiResponse.Fail("Email already in use");

        var user = new AppUser
        {
            Id = Guid.NewGuid().ToString(),
            Email = request.Email,
            NormalizedEmail = request.Email.ToUpperInvariant(),
            UserName = request.Email,
            NormalizedUserName = request.Email.ToUpperInvariant(),
            DisplayName = request.DisplayName,
            PasswordHash = HashPassword(request.Password),
            SecurityStamp = Guid.NewGuid().ToString(),
            ConcurrencyStamp = Guid.NewGuid().ToString(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
            IsActive = true
        };

        var created = await _userRepository.CreateAsync(user);
        var token = _tokenService.GenerateToken(created.Id);

        var dto = new UserDto(created.Id, created.DisplayName, created.Email, created.AvatarUrl, created.Bio, created.CreatedAt);
        return ApiResponse.Ok(new AuthResponseDto(token, dto));
    }

    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes);
    }
}

// --- Login ---
public record LoginCommand(string Email, string Password) : IRequest<ApiResponse>;

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email).NotEmpty();
        RuleFor(x => x.Password).NotEmpty();
    }
}

public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, ApiResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public LoginCommandHandler(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<ApiResponse> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email);
        if (user is null || HashPassword(request.Password) != user.PasswordHash)
            return ApiResponse.Fail("Invalid email or password");

        var token = _tokenService.GenerateToken(user.Id);
        var dto = new UserDto(user.Id, user.DisplayName, user.Email, user.AvatarUrl, user.Bio, user.CreatedAt);
        return ApiResponse.Ok(new AuthResponseDto(token, dto));
    }

    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToHexString(bytes);
    }
}

// --- Refresh Token ---
public record RefreshTokenCommand(string UserId) : IRequest<ApiResponse>;

public sealed class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, ApiResponse>
{
    private readonly IUserRepository _userRepository;
    private readonly ITokenService _tokenService;

    public RefreshTokenCommandHandler(IUserRepository userRepository, ITokenService tokenService)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
    }

    public async Task<ApiResponse> Handle(RefreshTokenCommand request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId);
        if (user is null)
            return ApiResponse.Fail("User not found");

        var token = _tokenService.GenerateToken(user.Id);
        var dto = new UserDto(user.Id, user.DisplayName, user.Email, user.AvatarUrl, user.Bio, user.CreatedAt);
        return ApiResponse.Ok(new AuthResponseDto(token, dto));
    }
}
