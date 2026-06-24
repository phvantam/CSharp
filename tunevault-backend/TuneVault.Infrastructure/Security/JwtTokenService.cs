using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using TuneVault.Application.Common;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure
{
    public class JwtTokenService : IJwtTokenService
    {
        private readonly JwtOptions _options;
        private readonly byte[] _keyBytes;

        public JwtTokenService(IOptions<JwtOptions> options)
        {
            _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
            if (string.IsNullOrWhiteSpace(_options.SecretKey))
                throw new ArgumentException("JwtOptions.SecretKey is not configured.");

            _keyBytes = Encoding.UTF8.GetBytes(_options.SecretKey);
        }

        public string GenerateToken(User user)
        {
            if (user == null) throw new ArgumentNullException(nameof(user));

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.UniqueName, user.UserName ?? string.Empty),
                new Claim("display_name", user.DisplayName ?? string.Empty),
                new Claim("is_active", user.IsActive ? "1" : "0"),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var creds = new SigningCredentials(new SymmetricSecurityKey(_keyBytes), SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: _options.Issuer,
                audience: _options.Audience,
                claims: claims,
                notBefore: DateTime.UtcNow,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}