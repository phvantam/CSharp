using System;
using System.Threading;
using System.Threading.Tasks;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TuneVault.Application.Common;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Auth
{
    public class LoginCommand : IRequest<AuthResponseDto>
    {
        public string Username { get; set; } = default!;
        public string Password { get; set; } = default!;
    }

    public class LoginCommandValidator : AbstractValidator<LoginCommand>
    {
        public LoginCommandValidator()
        {
            RuleFor(x => x.Username).NotEmpty().WithMessage("Username is required.");
            RuleFor(x => x.Password).NotEmpty().WithMessage("Password is required.");
        }
    }

    public class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponseDto>
    {
        // Sử dụng DbContext gốc của EF Core để không bị phụ thuộc tầng dữ liệu
        private readonly DbContext _db;
        private readonly IJwtTokenService _jwt;

        public LoginCommandHandler(DbContext db, IJwtTokenService jwt)
        {
            _db = db;
            _jwt = jwt;
        }

        public async Task<AuthResponseDto> Handle(LoginCommand request, CancellationToken cancellationToken)
        {
            // Trỏ trực tiếp vào DbSet<User> thông qua hàm Set<User>()
            var user = await _db.Set<User>().FirstOrDefaultAsync(u => u.UserName == request.Username, cancellationToken);
            if (user == null)
                throw new UnauthorizedAccessException("Invalid credentials.");

            if (user.PasswordHash != request.Password)
                throw new UnauthorizedAccessException("Invalid credentials.");

            var token = _jwt.GenerateToken(user);

            return new AuthResponseDto
            {
                Id = user.Id,
                Username = user.UserName,
                DisplayName = user.DisplayName,
                Token = token
            };
        }
    }
}