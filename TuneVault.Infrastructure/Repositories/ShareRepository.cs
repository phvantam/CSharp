using Microsoft.EntityFrameworkCore;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence;

public class ShareRepository : IShareRepository
{
    private readonly TuneVaultDbContext _context;

    public ShareRepository(TuneVaultDbContext context)
    {
        _context = context;
    }

    public async Task AddAsync(Share share)
    {
        await _context.Shares.AddAsync(share);
        await _context.SaveChangesAsync();
    }

    // BỔ SUNG 3 HÀM DƯỚI ĐÂY THEO INTERFACE CỦA BẠN:
    
    public async Task<bool> ExistsShareAsync(string senderId, string receiverId, Guid? mediaItemId, Guid? playlistId)
    {
        return await _context.Shares.AnyAsync(s => 
            s.SenderUserId.ToString() == senderId && 
            s.ReceiverUserId.ToString() == receiverId && 
            s.MediaItemId == mediaItemId && 
            s.PlaylistId == playlistId);
    }

    public async Task<IEnumerable<Share>> GetSharedWithMeAsync(string userId)
    {
        return await _context.Shares
            .Where(s => s.ReceiverUserId.ToString() == userId)
            .ToListAsync();
    }

    public async Task<IEnumerable<Share>> GetSharedByMeAsync(string userId)
    {
        return await _context.Shares
            .Where(s => s.SenderUserId.ToString() == userId)
            .ToListAsync();
    }
}