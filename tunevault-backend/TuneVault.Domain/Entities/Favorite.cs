using System;

namespace TuneVault.Domain.Entities;

public class Favorite
{
    public long FavoriteId { get; set; }

    public string UserId { get; set; } = null!;

    public long MediaItemId { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual MediaItem MediaItem { get; set; } = null!;

    public virtual AppUser User { get; set; } = null!;
}
