using MediatR;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Features.UserProfile;
using TuneVault.Domain.Interfaces;

namespace TuneVault.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IFileStorageService _fileStorageService;

    public UserController(IMediator mediator, IFileStorageService fileStorageService)
    {
        _mediator = mediator;
        _fileStorageService = fileStorageService;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new GetProfileQuery(userId));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new GetProfileQuery(userId));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPut("me")]
    public async Task<IActionResult> UpdateUserJson([FromBody] UpdateUserRequest req)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new UpdateProfileCommand(userId, req.DisplayName, req.Bio, req.AvatarUrl));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPut("profile")]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> UpdateProfileForm()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        if (!Request.HasFormContentType) return BadRequest(Application.Common.ApiResponse.Fail("Form content required"));
        var form = await Request.ReadFormAsync();
        var displayName = form["displayName"].ToString();
        var bio = form["bio"].ToString();

        string? avatarUrl = null;
        var avatarFile = form.Files.GetFile("avatar");
        if (avatarFile is not null && avatarFile.Length > 0)
        {
            var filePath = await _fileStorageService.SaveFileAsync(avatarFile.OpenReadStream(), avatarFile.FileName);
            avatarUrl = $"/uploads/{Path.GetFileName(filePath)}";
        }

        var result = await _mediator.Send(new UpdateProfileCommand(userId, displayName, bio, avatarUrl));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchUsers([FromQuery] string? q)
    {
        var result = await _mediator.Send(new SearchUsersQuery(q ?? ""));
        return Ok(result);
    }
}

public record UpdateUserRequest(string? DisplayName, string? Bio, string? AvatarUrl);
