using MediatR;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Features.Playlists;

namespace TuneVault.Api.Controllers;

[ApiController]
[Route("api/playlists")]
public class PlaylistController : ControllerBase
{
    private readonly IMediator _mediator;
    public PlaylistController(IMediator mediator) => _mediator = mediator;

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreatePlaylistRequest req)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new CreatePlaylistCommand(userId, req.Title, req.Visibility));
        return Created($"/api/playlists/{((dynamic)result.Data!).PlaylistId}", result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(long id)
    {
        var result = await _mediator.Send(new GetPlaylistQuery(id));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetUserPlaylists()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new GetUserPlaylistsQuery(userId));
        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(long id, [FromBody] UpdatePlaylistRequest req)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new UpdatePlaylistCommand(id, userId, req.Title, req.Visibility));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(long id)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new DeletePlaylistCommand(id, userId));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost("{id}/tracks")]
    public async Task<IActionResult> AddTrack(long id, [FromBody] PlaylistTrackRequest req)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new AddTrackToPlaylistCommand(id, req.MediaItemId, userId));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{playlistId}/tracks/{mediaId}")]
    public async Task<IActionResult> RemoveTrack(long playlistId, long mediaId)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new RemoveTrackFromPlaylistCommand(playlistId, mediaId, userId));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string? q)
    {
        var userId = User.FindFirst("sub")?.Value;
        var result = await _mediator.Send(new Application.Features.Search.SearchPlaylistsQuery(q ?? "", userId));
        return Ok(result);
    }
}

public record CreatePlaylistRequest(string Title, string? Visibility);
public record UpdatePlaylistRequest(string? Title, string? Visibility);
public record PlaylistTrackRequest(long MediaItemId);
