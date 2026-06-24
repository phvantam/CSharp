using MediatR;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Features.Interactions;

namespace TuneVault.Api.Controllers;

[ApiController]
[Route("api")]
public class InteractionController : ControllerBase
{
    private readonly IMediator _mediator;
    public InteractionController(IMediator mediator) => _mediator = mediator;

    [HttpPost("favorites/{mediaId}")]
    public async Task<IActionResult> ToggleFavorite(long mediaId)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new ToggleFavoriteCommand(userId, mediaId));
        return Ok(result);
    }

    [HttpGet("favorites")]
    public async Task<IActionResult> GetFavorites()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new GetFavoritesQuery(userId));
        return Ok(result);
    }

    [HttpPost("play-history")]
    public async Task<IActionResult> RecordPlay([FromBody] RecordPlayRequest req)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new RecordPlayHistoryCommand(userId, req.MediaItemId));
        return Ok(result);
    }

    [HttpGet("play-history/recent")]
    public async Task<IActionResult> GetRecentHistory()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new GetRecentHistoryQuery(userId));
        return Ok(result);
    }
}

public record RecordPlayRequest(long MediaItemId);
