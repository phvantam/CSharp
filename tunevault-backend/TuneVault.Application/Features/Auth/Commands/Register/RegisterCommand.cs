using MediatR;
using TuneVault.Application.DTOs.Auth;

namespace TuneVault.Application.Features.Auth.Commands.Register;

public record RegisterCommand(RegisterDto RegisterDto) : IRequest<AuthResponseDto>;