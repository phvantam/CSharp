using TuneVault.Domain.Entities;

namespace TuneVault.Domain.Interfaces;

public interface IUnitOfWork : IDisposable
{
    IRepository<MediaItem> MediaItems { get; }
    IRepository<Playlist> Playlists { get; }
    IRepository<PlaylistTrack> PlaylistTracks { get; }
    IRepository<MediaShare> MediaShares { get; }
    IRepository<Notification> Notifications { get; }
    IRepository<Favorite> Favorites { get; }
    IRepository<PlayHistory> PlayHistories { get; }
    IRepository<Follow> Follows { get; }

    Task<int> CompleteAsync();
}