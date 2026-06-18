using Microsoft.EntityFrameworkCore;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence;

public class MediaRepository : IMediaRepository
{
    private readonly TuneVaultDbContext _context;

    public MediaRepository(TuneVaultDbContext context)
    {
        _context = context;
    }

    public async Task<MediaItem?> GetByIdAsync(Guid id)
    {
        return await _context.MediaItems.FindAsync(id);
    }

    public async Task<IEnumerable<MediaItem>> GetAllAsync()
{
    // Giả sử bạn đang dùng Entity Framework Core với _context
    return await _context.MediaItems.ToListAsync();
}
    // BỔ SUNG 3 HÀM DƯỚI ĐÂY ĐỂ KHỚP CHÍNH XÁC VỚI INTERFACE CỦA BẠN:

    // Giả sử hàm của bạn nhận vào một tham số string userId (hoặc string id)
// Bổ sung hàm GetByOwnerAsync để thỏa mãn điều kiện của IMediaRepository
public async Task<IEnumerable<MediaItem>> GetByOwnerAsync(string ownerId)
{
    // 1. Kiểm tra và ép kiểu chuỗi string ownerId sang dạng Guid an toàn
    if (!Guid.TryParse(ownerId, out Guid ownerGuid))
    {
        return Enumerable.Empty<MediaItem>();
    }

    // 2. Truy vấn danh sách bài hát thuộc về Owner này
    // Lưu ý: Hãy kiểm tra xem trường lưu ID người tạo trong MediaItem của bạn 
    // tên là UserId hay OwnerId để sửa lại đoạn "m.UserId" cho đúng nhé!
    return await _context.MediaItems
        .Where(m => m.UserId == ownerGuid) 
        .ToListAsync();
}

    public async Task AddAsync(MediaItem mediaItem)
    {
        await _context.MediaItems.AddAsync(mediaItem);
        await _context.SaveChangesAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        var mediaItem = await _context.MediaItems.FindAsync(id);
        if (mediaItem != null)
        {
            _context.MediaItems.Remove(mediaItem);
            await _context.SaveChangesAsync();
        }
    }
}