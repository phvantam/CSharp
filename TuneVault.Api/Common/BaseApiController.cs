using Microsoft.AspNetCore.Mvc;
using TuneVault.Api.Common;

namespace TuneVault.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BaseApiController : ControllerBase
    {
        // Trả về 200 OK kèm data bọc gói chuẩn
        protected IActionResult OkResponse<T>(T data)
        {
            return Ok(ApiResponse<T>.SuccessResult(data));
        }

        // Trả về 400 Bad Request kèm thông báo lỗi bọc gói chuẩn
        protected IActionResult BadResponse(string errorMessage)
        {
            return BadRequest(ApiResponse<object>.FailureResult(errorMessage));
        }

        // Trả về 400 Bad Request kèm danh sách nhiều lỗi (Validation)
        protected IActionResult BadResponse(List<string> errorMessages)
        {
            return BadRequest(ApiResponse<object>.FailureResult(errorMessages));
        }

        // Trả về 404 Not Found kèm thông báo lỗi bọc gói chuẩn
        protected IActionResult NotFoundResponse(string errorMessage)
        {
            return NotFound(ApiResponse<object>.FailureResult(errorMessage));
        }
    }
}