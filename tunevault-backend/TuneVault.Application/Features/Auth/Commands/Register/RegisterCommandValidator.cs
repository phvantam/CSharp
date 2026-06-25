using FluentValidation;
using TuneVault.Application.Features.Auth.Commands.Register;

namespace TuneVault.Application.Features.Auth.Commands.Register;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    public RegisterCommandValidator()
    {
        RuleFor(x => x.RegisterDto.Username)
            .NotEmpty().WithMessage("Tên đăng nhập không được để trống")
            .MinimumLength(4).WithMessage("Tên đăng nhập phải có ít nhất 4 ký tự")
            .Matches("^[a-zA-Z0-9_]+$").WithMessage("Tên đăng nhập chỉ được chứa chữ cái, số và dấu gạch dưới");

        RuleFor(x => x.RegisterDto.DisplayName)
            .NotEmpty().WithMessage("Tên hiển thị không được để trống")
            .MinimumLength(3).WithMessage("Tên hiển thị phải có ít nhất 3 ký tự");

        RuleFor(x => x.RegisterDto.Email)
            .NotEmpty().EmailAddress();

        RuleFor(x => x.RegisterDto.Password)
            .NotEmpty().MinimumLength(6);
    }
}