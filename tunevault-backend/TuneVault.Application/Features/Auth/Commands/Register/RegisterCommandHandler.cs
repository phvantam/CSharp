using MediatR;
using TuneVault.Application.DTOs.Auth;
using TuneVault.Application.Features.Auth.Commands.Register;
using TuneVault.Application.Interfaces;

namespace TuneVault.Application.Features.Auth.Commands.Register;

public class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
{
    private readonly IAuthService _authService;

    public RegisterCommandHandler(IAuthService authService)
    {
        _authService = authService;
    }

    public async Task<AuthResponseDto> Handle(RegisterCommand command, CancellationToken cancellationToken)
    {
        var result = await _authService.RegisterAsync(command.RegisterDto);

        if (result == null)
            throw new Exception("Email đã được sử dụng hoặc thông tin không hợp lệ.");

        return result;
    }
}