namespace TuneVault.Application.Features.Auth.DTOs;

public record AuthResponseDto(string Token, Guid UserId, string Email, string DisplayName);
public record RegisterDto(string Email, string Password, string DisplayName);
public record LoginDto(string Email, string Password);