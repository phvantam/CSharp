namespace TuneVault.Application.Common;

public interface ITokenService
{
    string GenerateToken(string userId);
    bool ValidateToken(string token);
    string? GetUserId(string token);
}
