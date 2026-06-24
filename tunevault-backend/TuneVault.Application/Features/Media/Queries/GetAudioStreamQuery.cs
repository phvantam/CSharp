using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Media.Queries
{
    public class AudioStreamDto
    {
        public string FilePath { get; set; } = default!;
        public string ContentType { get; set; } = default!;
    }

    public class GetAudioStreamQuery : IRequest<AudioStreamDto?>
    {
        public long MediaItemId { get; set; }
        public GetAudioStreamQuery(long id) => MediaItemId = id;
    }

    public class GetAudioStreamQueryHandler : IRequestHandler<GetAudioStreamQuery, AudioStreamDto?>
    {
        private readonly DbContext _db;

        public GetAudioStreamQueryHandler(DbContext db)
        {
            _db = db;
        }

        public async Task<AudioStreamDto?> Handle(GetAudioStreamQuery request, CancellationToken cancellationToken)
        {
            var media = await _db.Set<MediaItem>()
                .FirstOrDefaultAsync(m =>
                    m.MediaItemId == request.MediaItemId &&
                    m.FilePath != null &&
                    (m.FilePath.EndsWith(".mp3") || m.FilePath.Contains("/audio/")),
                    cancellationToken);

            if (media == null)
                return null;

            return new AudioStreamDto
            {
                FilePath = media.FilePath,
                ContentType = "audio/mpeg"
            };
        }
    }
}