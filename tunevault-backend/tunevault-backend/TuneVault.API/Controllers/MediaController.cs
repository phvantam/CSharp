using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using TuneVault.Application.Features.Media.Queries;

namespace TuneVault.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class MediaController : ControllerBase
    {
        private readonly IMediator _mediator;

        public MediaController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet("{id}/stream")]
        public async Task<IActionResult> Stream(long id)
        {
            try
            {
                var result = await _mediator.Send(new GetMediaStreamQuery(id));
                return PhysicalFile(result.FilePath, result.MimeType, enableRangeProcessing: true);
            }
            catch (KeyNotFoundException)
            {
                return NotFound();
            }
        }

        [HttpGet("{id}/stream/audio")]
        public async Task<IActionResult> StreamAudio(long id)
        {
            var result = await _mediator.Send(new GetAudioStreamQuery(id));
            if (result == null || string.IsNullOrWhiteSpace(result.FilePath))
                return NotFound();

            // Normalize incoming stored path to an absolute path on C: drive
            // Trim leading slashes, convert to platform separator characters
            var trimmed = result.FilePath.TrimStart('\\', '/');
            var normalized = trimmed.Replace('/', Path.DirectorySeparatorChar).Replace('\\', Path.DirectorySeparatorChar);
            var absolutePath = Path.Combine("C:\\", normalized);

            if (!System.IO.File.Exists(absolutePath))
                return NotFound();

            return PhysicalFile(absolutePath, result.ContentType, enableRangeProcessing: true);
        }
    }
}
