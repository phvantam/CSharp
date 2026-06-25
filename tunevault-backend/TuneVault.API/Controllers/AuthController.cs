using Microsoft.AspNetCore.Mvc;
using MediatR;
using TuneVault.Application.Common;
using TuneVault.Application.DTOs.Auth;
using TuneVault.Application.Features.Auth.Commands.Login;
using TuneVault.Application.Features.Auth.Commands.Register;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator)
    {
        _mediator = mediator;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _mediator.Send(new RegisterCommand(dto));

        if (result == null)
            return BadRequest(ApiResponse<object>.ErrorResponse("Email đã được sử dụng hoặc thông tin không hợp lệ."));

        return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(result, "Đăng ký thành công"));
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _mediator.Send(new LoginCommand(dto));

        if (result == null)
            return Unauthorized(ApiResponse<object>.ErrorResponse("Email hoặc mật khẩu không đúng."));

        return Ok(ApiResponse<AuthResponseDto>.SuccessResponse(result, "Đăng nhập thành công"));
    }
}