using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TuneVault.Application.Features.Playlists.Commands;
using TuneVault.Application.Features.Playlists.Queries;
using TuneVault.Api.Common; // Đã chuyển sang thư mục Common chứa cấu trúc ApiResponse chuẩn

namespace TuneVault.Api.Controllers;

[Authorize]
[Produces("application/json")]
public class PlaylistController : BaseApiController
{
    private readonly IMediator _mediator;

    public PlaylistController(IMediator mediator)
    {
        _mediator = mediator;
    }

    // Thuộc tính lấy nhanh UserId từ Token của người dùng đang đăng nhập công khai
    private string CurrentUserId => User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? throw new UnauthorizedAccessException("Không tìm thấy thông tin định danh người dùng.");

    /// <summary>
    /// Lấy danh sách toàn bộ danh sách phát (Playlist) của người dùng hiện tại
    /// </summary>
    /// <returns>Danh sách các playlist thuộc sở hữu của cá nhân</returns>
    /// <response code="200">Lấy dữ liệu thành công</response>
    /// <response code="401">Chưa đăng nhập hoặc token không hợp lệ</response>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IEnumerable<object>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> GetMyPlaylists()
    {
        try
        {
            var result = await _mediator.Send(new GetMyPlaylistsQuery(CurrentUserId));
            
            // Sử dụng hàm lớp cha gánh vác: Tự động bọc gói { success: true, data: result }
            return OkResponse(result);
        }
        catch (Exception ex)
        {
            // Tự động bọc gói lỗi { success: false, data: null, errors: [ex.Message] }
            return BadResponse(ex.Message);
        }
    }

    /// <summary>
    /// Lấy chi tiết thông tin một Playlist theo mã ID
    /// </summary>
    /// <param name="id">Mã định danh GUID của danh sách phát</param>
    /// <response code="200">Tìm thấy danh sách phát và trả về thông tin chi tiết</response>
    /// <response code="404">Không tìm thấy Playlist hoặc không có quyền truy cập</response>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var result = await _mediator.Send(new GetPlaylistByIdQuery(id, CurrentUserId));
            if (result == null) 
                return NotFoundResponse("Không tìm thấy danh sách phát yêu cầu.");

            return OkResponse(result);
        }
        catch (Exception ex)
        {
            return BadResponse(ex.Message);
        }
    }

    /// <summary>
    /// Tạo mới một danh sách phát (Playlist)
    /// </summary>
    /// <param name="request">Thông tin bao gồm Tiêu đề, Mô tả và Ảnh nền</param>
    /// <response code="201">Tạo thành công playlist mới kèm đường dẫn chi tiết trên Header</response>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreatePlaylistRequest request)
    {
        try
        {
            var result = await _mediator.Send(new CreatePlaylistCommand(
                CurrentUserId,
                request.Title,
                request.Description,
                request.CoverImageUrl
            ));

            // Bọc gói dữ liệu trả về chuẩn hóa cho API Tạo mới dữ liệu
            var response = ApiResponse<object>.SuccessResult(result);
            return CreatedAtAction(nameof(GetById), new { id = result.Id }, response);
        }
        catch (Exception ex)
        {
            return BadResponse(ex.Message);
        }
    }

    /// <summary>
    /// Cập nhật thông tin chi tiết của một Playlist sẵn có
    /// </summary>
    /// <param name="id">Mã định danh GUID của playlist cần sửa</param>
    /// <param name="request">Thông tin chỉnh sửa</param>
    /// <response code="200">Cập nhật thông tin thành công</response>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdatePlaylistRequest request)
    {
        try
        {
            var result = await _mediator.Send(new UpdatePlaylistCommand(
                id,
                CurrentUserId,
                request.Title,
                request.Description,
                request.CoverImageUrl
            ));
            
            return OkResponse(result);
        }
        catch (Exception ex)
        {
            return BadResponse(ex.Message);
        }
    }

    /// <summary>
    /// Xóa hoàn toàn một danh sách phát khỏi hệ thống
    /// </summary>
    /// <param name="id">Mã định danh GUID của playlist cần xóa</param>
    /// <response code="200">Xóa thành công</response>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _mediator.Send(new DeletePlaylistCommand(id, CurrentUserId));
            return OkResponse("Xóa danh sách phát thành công.");
        }
        catch (Exception ex)
        {
            return BadResponse(ex.Message);
        }
    }

    /// <summary>
    /// Thêm một bài hát hoặc video vào trong danh sách phát (Đang phát triển)
    /// </summary>
    /// <param name="id">Mã định danh của playlist</param>
    /// <param name="request">Thông tin bản ghi item cần chèn</param>
    [HttpPost("{id:guid}/items")]
    [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
    public async Task<IActionResult> AddItem(Guid id, [FromBody] AddPlaylistItemRequest request)
    {
        // TODO: tạo AddPlaylistItemCommand sau ở tầng Application
        return OkResponse("Tính năng đang được phát triển.");
    }
}

// ==========================================
// Models nhận dữ liệu từ Client (Dữ liệu mô tả cấu trúc cho Swagger)
// ==========================================

public record CreatePlaylistRequest(string Title, string? Description, string? CoverImageUrl);
public record UpdatePlaylistRequest(string? Title, string? Description, string? CoverImageUrl);
public record AddPlaylistItemRequest(Guid MediaItemId, int Order);