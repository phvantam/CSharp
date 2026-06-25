using MediatR;
using TuneVault.Application.DTOs.Auth;
using TuneVault.Application.Features.Auth.Commands.Login;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Auth.Commands.Login;

public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponseDto>
{
    private readonly IAuthService _authService;

    public LoginCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<AuthResponseDto> Handle(LoginCommand command, CancellationToken cancellationToken)
    {
        var result = await _authService.LoginAsync(command.LoginDto);

        if (result == null)
            throw new UnauthorizedAccessException("Email hoặc mật khẩu không đúng.");

        return result;
    }
}