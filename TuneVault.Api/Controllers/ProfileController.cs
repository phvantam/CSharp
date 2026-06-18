using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TuneVault.Application.Features.Profile.Commands;
using TuneVault.Application.Features.Profile.Queries;
using TuneVault.Api.Common; // Đã cập nhật namespace đúng vị trí file ApiResponse

namespace TuneVault.Api.Controllers;

[Authorize]
[Produces("application/json")]
public class ProfileController : BaseApiController
{
    private readonly IMediator _mediator;

    public ProfileController(IMediator mediator)
    {
        _mediator = mediator;
    }

    private string CurrentUserId => User.FindFirst(ClaimTypes.NameIdentifier)?.Value
        ?? throw new UnauthorizedAccessException("Không tìm thấy thông tin định danh người dùng.");

    /// <summary>
    /// Lấy thông tin Profile cá nhân của người dùng đang đăng nhập
    /// </summary>
    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMe()
    {
        try
        {
            var result = await _mediator.Send(new GetCurrentProfileQuery(CurrentUserId));
            return OkResponse(result);
        }
        catch (Exception ex)
        {
            return BadResponse(ex.Message);
        }
    }

    /// <summary>
    /// Cập nhật thông tin cá nhân
    /// </summary>
    [HttpPut]
    [HttpPatch] // Có thể dùng chung logic vì lệnh Command thực hiện cập nhật theo nhu cầu
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        try
        {
            var result = await _mediator.Send(new UpdateProfileCommand(
                CurrentUserId,
                request.DisplayName,
                request.AvatarUrl,
                request.Bio
            ));
            return OkResponse(result);
        }
        catch (Exception ex)
        {
            return BadResponse(ex.Message);
        }
    }

    /// <summary>
    /// Xem thông tin Hồ sơ công khai của một người dùng bất kỳ
    /// </summary>
    [HttpGet("{id}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(string id)
    {
        try
        {
            var result = await _mediator.Send(new GetCurrentProfileQuery(id));
            if (result == null)
                return NotFoundResponse("Không tìm thấy tài khoản người dùng yêu cầu.");

            return OkResponse(result);
        }
        catch (Exception ex)
        {
            return BadResponse(ex.Message);
        }
    }
}

// Model nhận dữ liệu
public record UpdateProfileRequest(string? DisplayName, string? AvatarUrl, string? Bio);