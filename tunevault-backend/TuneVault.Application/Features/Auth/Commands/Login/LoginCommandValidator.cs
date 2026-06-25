using FluentValidation;
using TuneVault.Application.Features.Auth.Commands.Login;

namespace TuneVault.Application.Features.Auth.Commands.Login;

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.LoginDto.LoginIdentifier)
            .NotEmpty().WithMessage("Vui lòng nhập email hoặc tên đăng nhập");

        RuleFor(x => x.LoginDto.Password)
            .NotEmpty().WithMessage("Mật khẩu không được để trống");
    }
}