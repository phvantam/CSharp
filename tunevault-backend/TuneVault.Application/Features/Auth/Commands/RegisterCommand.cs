using MediatR;
using TuneVault.Application.Features.Auth.DTOs;

namespace TuneVault.Application.Features.Auth.Commands;

// File này CHỈ chứa duy nhất 1 dòng khai báo Record này:
public record RegisterCommand(string Email, string Password, string DisplayName) : IRequest<AuthResponseDto>;