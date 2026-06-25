using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MediatR;
using TuneVault.Application.Common;
using TuneVault.Application.DTOs.Media;
using TuneVault.Application.Features.PlayHistory.Queries.GetPlayHistory;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/history")]
[Authorize]
public class PlayHistoryController : ControllerBase
{
    private readonly IMediator _mediator;

    public PlayHistoryController(IMediator mediator)
    {
        _mediator = mediator;
    }

   [HttpGet]
    public async Task<IActionResult> GetPlayHistory([FromQuery] int page = 1, [FromQuery] int pageSize = 20)
{
    var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    if (string.IsNullOrEmpty(userId))
        return Unauthorized(ApiResponse<object>.ErrorResponse("Không xác định được người dùng"));

    var result = await _mediator.Send(new GetPlayHistoryQuery(userId, pageSize));
    return Ok(ApiResponse<List<MediaItemDto>>.SuccessResponse(result));
}
}