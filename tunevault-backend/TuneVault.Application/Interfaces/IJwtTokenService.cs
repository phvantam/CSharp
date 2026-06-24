using TuneVault.Domain.Entities;

namespace TuneVault.Application.Common
{
    public interface IJwtTokenService
    {
        string GenerateToken(User user);
    }
}