using MediatR;
using TuneVault.Application.DTOs.Auth;

namespace TuneVault.Application.Features.Auth.Commands.Login;

public record LoginCommand(LoginDto LoginDto) : IRequest<AuthResponseDto>;