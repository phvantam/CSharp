using TuneVault.Domain.Entities;
using TuneVault.Domain.Interfaces;
using TuneVault.Infrastructure.Persistence;

namespace TuneVault.Infrastructure.Repositories;

public class UnitOfWork : IUnitOfWork
{
    private readonly ApplicationDbContext _context;

    public IRepository<MediaItem> MediaItems { get; private set; }
    public IRepository<Playlist> Playlists { get; private set; }
    public IRepository<PlaylistTrack> PlaylistTracks { get; private set; }
    public IRepository<MediaShare> MediaShares { get; private set; }
    public IRepository<Notification> Notifications { get; private set; }
    public IRepository<Favorite> Favorites { get; private set; }
    public IRepository<PlayHistory> PlayHistories { get; private set; }
    public IRepository<Follow> Follows { get; private set; }

    public UnitOfWork(ApplicationDbContext context)
    {
        _context = context;

        MediaItems = new GenericRepository<MediaItem>(_context);
        Playlists = new GenericRepository<Playlist>(_context);
        PlaylistTracks = new GenericRepository<PlaylistTrack>(_context);
        MediaShares = new GenericRepository<MediaShare>(_context);
        Notifications = new GenericRepository<Notification>(_context);
        Favorites = new GenericRepository<Favorite>(_context);
        PlayHistories = new GenericRepository<PlayHistory>(_context);
        Follows = new GenericRepository<Follow>(_context);
    }

    public async Task<int> CompleteAsync()
    {
        return await _context.SaveChangesAsync();
    }

    public void Dispose()
    {
        _context.Dispose();
    }
}