using MediatR;
using TuneVault.Application.Features.Auth.DTOs;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Auth.Commands;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenService _jwtTokenService;

    // Định nghĩa Constructor truyền thống duy nhất, không dùng Primary Constructor dòng đầu nữa để tránh lộn biến
    public RegisterCommandHandler(IUserRepository userRepository, IJwtTokenService jwtTokenService)
    {
        _userRepository = userRepository;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResponseDto> Handle(RegisterCommand request, CancellationToken cancellationToken)
    {
        // 1. Kiểm tra Email trùng lặp
        var existingUser = await _userRepository.GetByEmailAsync(request.Email);
        if (existingUser is not null)
        {
            throw new InvalidOperationException("Email này đã được sử dụng trên hệ thống.");
        }

        // 2. Hash password bằng BCrypt
        string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

        // 3. Tạo User Entity mới
        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            PasswordHash = passwordHash,
            DisplayName = request.DisplayName,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepository.AddAsync(user);

        // 4. Tạo JWT Token truyền đúng 3 tham số
        var token = _jwtTokenService.GenerateToken(user.Id, user.Email, user.DisplayName);

        // 5. Trả về kết quả DTO hợp lệ
        return new AuthResponseDto(token, user.Id, user.Email, user.DisplayName);
    }
}