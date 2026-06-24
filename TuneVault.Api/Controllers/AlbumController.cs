using MediatR;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Common;
using TuneVault.Application.Features.Albums;
using TuneVault.Application.Features.Search;
using TuneVault.Domain.Interfaces;

namespace TuneVault.Api.Controllers;

[ApiController]
[Route("api/albums")]
public class AlbumController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IFileStorageService _fileStorageService;

    public AlbumController(IMediator mediator, IFileStorageService fileStorageService)
    {
        _mediator = mediator;
        _fileStorageService = fileStorageService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var result = await _mediator.Send(new GetAllAlbumsQuery());
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var result = await _mediator.Send(new GetAlbumQuery(id));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpPost]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> Create()
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        if (!Request.HasFormContentType) return BadRequest(ApiResponse.Fail("Form content required"));
        var form = await Request.ReadFormAsync();
        var title = form["title"].ToString();
        var artistName = form["artistName"].ToString();
        var description = form["description"].ToString();

        if (string.IsNullOrWhiteSpace(title)) return BadRequest(ApiResponse.Fail("Title is required"));

        string? coverImageUrl = null;
        var coverImageFile = form.Files.GetFile("coverImage");
        if (coverImageFile is not null && coverImageFile.Length > 0)
        {
            var coverPath = await _fileStorageService.SaveFileAsync(coverImageFile.OpenReadStream(), coverImageFile.FileName);
            coverImageUrl = $"/uploads/{Path.GetFileName(coverPath)}";
        }

        var result = await _mediator.Send(new CreateAlbumCommand(userId, title, artistName, description, coverImageUrl));
        return Created($"/api/albums/{((dynamic)result.Data!).AlbumId}", result);
    }

    [HttpPut("{id}")]
    [DisableRequestSizeLimit]
    public async Task<IActionResult> Update(int id)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        if (!Request.HasFormContentType) return BadRequest(ApiResponse.Fail("Form content required"));
        var form = await Request.ReadFormAsync();

        string? coverImageUrl = null;
        var coverImageFile = form.Files.GetFile("coverImage");
        if (coverImageFile is not null && coverImageFile.Length > 0)
        {
            var coverPath = await _fileStorageService.SaveFileAsync(coverImageFile.OpenReadStream(), coverImageFile.FileName);
            coverImageUrl = $"/uploads/{Path.GetFileName(coverPath)}";
        }

        var result = await _mediator.Send(new UpdateAlbumCommand(id, userId, form["title"].ToString(), form["artistName"].ToString(), form["description"].ToString(), coverImageUrl));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = User.FindFirst("sub")?.Value;
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();
        var result = await _mediator.Send(new DeleteAlbumCommand(id, userId));
        return result.Success ? Ok(result) : NotFound(result);
    }

    [HttpGet("search")]
    public async Task<IActionResult> Search([FromQuery] string? q)
    {
        var result = await _mediator.Send(new SearchAlbumsQuery(q ?? ""));
        return Ok(result);
    }
}
