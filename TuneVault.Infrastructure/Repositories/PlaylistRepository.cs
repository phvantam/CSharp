using Microsoft.EntityFrameworkCore;
using TuneVault.Application.Interfaces;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence;

public class PlaylistRepository : IPlaylistRepository
{
    private readonly TuneVaultDbContext _context;

    public PlaylistRepository(TuneVaultDbContext context)
    {
        _context = context;
    }

    public async Task<Playlist?> GetByIdAsync(Guid id)
    {
        return await _context.Playlists.FindAsync(id);
    }

    public async Task AddAsync(Playlist playlist)
    {
        await _context.Playlists.AddAsync(playlist);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Playlist playlist)
    {
        _context.Playlists.Update(playlist);
        await _context.SaveChangesAsync();
    }

    // SỬA VÀ BỔ SUNG 2 HÀM DƯỚI ĐÂY:

    public async Task<IEnumerable<Playlist>> GetByOwnerAsync(string userId)
    {
        // Lọc playlist theo UserId của người tạo
        return await _context.Playlists
            .Where(p => p.UserId.ToString() == userId)
            .ToListAsync();
    }

    public async Task DeleteAsync(Guid id)
    {
        // Tìm playlist theo Guid id nhận vào rồi xóa
        var playlist = await _context.Playlists.FindAsync(id);
        if (playlist != null)
        {
            _context.Playlists.Remove(playlist);
            await _context.SaveChangesAsync();
        }
    }
}