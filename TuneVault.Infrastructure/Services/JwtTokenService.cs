using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using TuneVault.Application.Interfaces;

namespace TuneVault.Infrastructure.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(Guid userId, string email, string displayName)
    {
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim("displayName", displayName),
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()) // Hỗ trợ lấy Id nhanh từ User.FindFirstValue
        };

        var secretKey = _configuration["JwtSettings:Secret"] 
            ?? "Thay_The_Bang_Chuoi_Key_Bi_Mat_Sieu_Dai_Cua_Ban_O_Day_Nhe";
            
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7), // Token hết hạn sau 7 ngày
            SigningCredentials = creds,
            Issuer = _configuration["JwtSettings:Issuer"],
            Audience = _configuration["JwtSettings:Audience"]
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var securityToken = tokenHandler.CreateToken(token);

        return tokenHandler.WriteToken(securityToken);
    }
}