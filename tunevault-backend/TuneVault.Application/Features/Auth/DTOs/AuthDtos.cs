namespace TuneVault.Application.Features.Auth.DTOs;

public record UserDto(string Id, string DisplayName, string Email, string? AvatarUrl, string? Bio, DateTimeOffset CreatedAt);
public record AuthResponseDto(string Token, UserDto User);
