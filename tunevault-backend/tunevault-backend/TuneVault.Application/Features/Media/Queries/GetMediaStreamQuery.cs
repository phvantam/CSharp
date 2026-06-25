using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.EntityFrameworkCore;
using TuneVault.Domain.Entities;

namespace TuneVault.Application.Features.Media.Queries
{
    public class MediaStreamDto
    {
        public string FilePath { get; set; } = default!;
        public string MimeType { get; set; } = default!;
    }

    public class GetMediaStreamQuery : IRequest<MediaStreamDto>
    {
        public long MediaItemId { get; set; }
        public GetMediaStreamQuery(long id) => MediaItemId = id;
    }

    public class GetMediaStreamQueryHandler : IRequestHandler<GetMediaStreamQuery, MediaStreamDto>
    {
        // Dùng DbContext chung của EF Core, tuyệt đối không dùng AppDbContext ở đây
        private readonly DbContext _db;

        public GetMediaStreamQueryHandler(DbContext db)
        {
            _db = db;
        }

        public async Task<MediaStreamDto> Handle(GetMediaStreamQuery request, CancellationToken cancellationToken)
        {
            // Sử dụng hàm .Set<MediaItem>() để chọc thẳng vào bảng dữ liệu thực tế
            var media = await _db.Set<MediaItem>()
                .FirstOrDefaultAsync(m => m.MediaItemId == request.MediaItemId, cancellationToken);

            if (media == null)
                throw new KeyNotFoundException($"Media item với ID {request.MediaItemId} không tồn tại.");

            return new MediaStreamDto
            {
                FilePath = media.FilePath,
                MimeType = media.MimeType
            };
        }
    }
}