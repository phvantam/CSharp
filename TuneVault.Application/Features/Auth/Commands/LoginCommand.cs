using MediatR;
using TuneVault.Application.Features.Auth.DTOs;
using TuneVault.Application.Interfaces;
using BCrypt.Net;
namespace TuneVault.Application.Features.Auth.Commands;

public record LoginCommand(string Email, string Password) : IRequest<AuthResponseDto>;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenService _jwtTokenService;

    public LoginCommandHandler(IUserRepository userRepository, IJwtTokenService jwtTokenService)
    {
        _userRepository = userRepository;
        _jwtTokenService = jwtTokenService;
    }

    public async Task<AuthResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        // 1. Tìm user theo email
        var user = await _userRepository.GetByEmailAsync(request.Email)
            ?? throw new UnauthorizedAccessException("Invalid email or password");

        // 2. Kiểm tra password khớp với hash không
        bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
        if (!isPasswordValid)
            throw new UnauthorizedAccessException("Invalid email or password");

        // 3. Tạo JWT Token nếu đăng nhập đúng
        var token = _jwtTokenService.GenerateToken(user.Id, user.Email, user.DisplayName);

        return new AuthResponseDto(token, user.Id, user.Email, user.DisplayName);
    }
}