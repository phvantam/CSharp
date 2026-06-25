using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TuneVault.Application.Features.Auth.DTOs;
using TuneVault.Application.Features.Auth.Commands;
using TuneVault.Application.Interfaces;
using TuneVault.Api.Common; // Đổi từ TuneVault.Api.Models sang .Common theo vị trí thực tế của bạn

namespace TuneVault.Api.Controllers;

[Produces("application/json")] // Khai báo định dạng trả về đồng nhất là JSON cho Swagger biết
public class AuthController : BaseApiController
{
    private readonly IMediator _mediator;
    private readonly IUserRepository _userRepository;

    public AuthController(IMediator mediator, IUserRepository userRepository)
    {
        _mediator = mediator;
        _userRepository = userRepository;
    }

    /// <summary>
    /// Đăng ký tài khoản người dùng mới
    /// </summary>
    /// <param name="request">Thông tin đăng ký gồm Email, Password và Tên hiển thị</param>
    /// <returns>Trả về thông tin kết quả đăng ký tài khoản thành công</returns>
    /// <response code="200">Đăng ký thành công, trả về dữ liệu người dùng mới</response>
    /// <response code="400">Dữ liệu yêu cầu không hợp lệ hoặc Email đã tồn tại</response>
    [HttpPost("register")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)] 
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Register([FromBody] RegisterDto request)
    {
        try
        {
            var result = await _mediator.Send(new RegisterCommand(request.Email, request.Password, request.DisplayName));
            
            // Sử dụng hàm của lớp cha: Tự động bọc gói { success: true, data: result, errors: null }
            return OkResponse(result);
        }
        catch (Exception ex)
        {
            // Sử dụng hàm của lớp cha: Tự động bọc gói { success: false, data: null, errors: [ex.Message] }
            return BadResponse(ex.Message);
        }
    }

    /// <summary>
    /// Đăng nhập hệ thống và cấp mã Access Token (JWT)
    /// </summary>
    /// <param name="request">Thông tin tài khoản đăng nhập (Email, Password)</param>
    /// <returns>Trả về JWT Token và thông tin cơ bản của người dùng</returns>
    /// <response code="200">Đăng nhập thành công, trả về Access Token</response>
    /// <response code="400">Sai tài khoản/mật khẩu hoặc dữ liệu gửi lên bị thiếu</response>
    [HttpPost("login")]
    [ProducesResponseType(typeof(ApiResponse<AuthResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Login([FromBody] LoginDto request)
    {
        try
        {
            var result = await _mediator.Send(new LoginCommand(request.Email, request.Password));
            
            // Sử dụng hàm của lớp cha trả về dữ liệu Token bọc gói
            return OkResponse(result);
        }
        catch (Exception ex)
        {
            return BadResponse(ex.Message);
        }
    }

    /// <summary>
    /// Lấy thông tin chi tiết của người dùng hiện tại đang đăng nhập
    /// </summary>
    /// <remarks>Yêu cầu gắn mã Token vào Header theo chuẩn: Authorization: Bearer [Token]</remarks>
    /// <returns>Trả về Profile chính mình dựa trên thông tin định danh mã hóa trong Token</returns>
    /// <response code="200">Xác thực thành công, trả về thông tin chi tiết</response>
    /// <response code="401">Mã Token không hợp lệ, hết hạn hoặc không được truyền lên Header</response>
    /// <response code="404">Không tìm thấy thông tin tài khoản tương ứng với mã Token</response>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMe()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userIdStr)) 
        {
            // Do hàm BaseApiController chưa định nghĩa Unauthorized, ta có thể dùng trực tiếp cấu trúc ApiResponse ở đây
            return Unauthorized(ApiResponse<object>.FailureResult("Vui lòng đăng nhập để thực hiện chức năng này."));
        }

        // Kiểm tra định dạng Guid để đảm bảo an toàn cho hệ thống
        if (!Guid.TryParse(userIdStr, out _))
        {
            return BadResponse("Token chứa cấu trúc UserId không đúng định dạng Guid.");
        }

        var user = await _userRepository.GetByIdAsync(userIdStr);
        if (user == null) 
        {
            return NotFoundResponse("Người dùng không tồn tại trên hệ thống.");
        }

        var profileData = new { user.Id, user.Email, user.DisplayName, user.CreatedAt };
        
        // Trả về gói dữ liệu sạch thông tin cá nhân qua lớp cha
        return OkResponse(profileData);
    }
}