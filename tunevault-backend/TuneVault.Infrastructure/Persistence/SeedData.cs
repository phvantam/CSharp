using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using TuneVault.Application.Common;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence;

public static class SeedData
{
    private const string SeedPassword = "Tam@123456";
    private const string DefaultAlbumCover = "/media/image/default-cover.svg";

    public static async Task SeedAsync(ApplicationDbContext context, UserManager<ApplicationUser> userManager)
    {
        var now = DateTime.UtcNow;

        var user1 = await CreateUserIfNotExistsAsync(userManager, "tampham", "tampham@gmail.com", "Phạm Văn Tâm");
        var user2 = await CreateUserIfNotExistsAsync(userManager, "nguyenvana", "nguyenvana@gmail.com", "Nguyễn Văn A");

        await CreateUserProfileIfNotExistsAsync(context, user1.Id, "Phạm Văn Tâm", now);
        await CreateUserProfileIfNotExistsAsync(context, user2.Id, "Nguyễn Văn A", now);
        await context.SaveChangesAsync();

        var seedArtistNames = new[]
        {
            "Sơn Tùng M-TP",
            "Vũ.",
            "Đen",
            "Hoàng Thùy Linh",
            "ERIK",
            "GREY D",
            "Min Quỳnh Anh",
            "HIEUTHUHAI",
            "MONO",
            "Phan Mạnh Quỳnh",
            "Nguyễn Thành Đạt"
        };

        foreach (var artistName in seedArtistNames)
        {
            await EnsureArtistAsync(context, artistName, now);
        }

        await context.SaveChangesAsync();

        var artistMap = await context.Artists
            .ToDictionaryAsync(a => a.Name, a => a.ArtistId);

        var albumMap = new Dictionary<string, Album>();

        foreach (var artistName in seedArtistNames)
        {
            if (!artistMap.TryGetValue(artistName, out var artistId))
                continue;

            albumMap[artistName] = await EnsureAlbumAsync(
                context,
                artistId,
                $"{artistName} Collection",
                $"Tuyển tập các bài hát của {artistName}",
                DefaultAlbumCover,
                "Compilation",
                now
            );
        }

        await context.SaveChangesAsync();

        await AddMediaIfMissingAsync(context, user1.Id, "Nơi Này Có Anh", "Sơn Tùng M-TP", albumMap, 278, 1250000, "/media/image/noinaycoanh.png", "/media/audio/noinaycoanh.mp3", "/media/video/noinaycoanh.mp4", now.AddDays(-45));
        await AddMediaIfMissingAsync(context, user1.Id, "Lạ Lùng", "Vũ.", albumMap, 260, 980000, "/media/image/lalung.jpg", "/media/audio/lalung.mp3", "/media/video/lalung.mp4", now.AddDays(-40));
        await AddMediaIfMissingAsync(context, user1.Id, "Mang Tiền Về Cho Mẹ", "Đen", albumMap, 407, 2100000, "/media/image/mangtienvechome.jpg", "/media/audio/mangtienvechome.mp3", "/media/video/mangtienvechome.mp4", now.AddDays(-35));
        await AddMediaIfMissingAsync(context, user1.Id, "See Tình", "Hoàng Thùy Linh", albumMap, 207, 870000, "/media/image/seetinh.jpg", "/media/audio/seetinh.mp3", "/media/video/seetinh.mp4", now.AddDays(-30));
        await AddMediaIfMissingAsync(context, user1.Id, "Sau Tất Cả", "ERIK", albumMap, 296, 760000, "/media/image/sautatca.jpg", "/media/audio/sautatca.mp3", "/media/video/sautatca.mp4", now.AddDays(-28));
        await AddMediaIfMissingAsync(context, user1.Id, "Có Hẹn Với Thanh Xuân", "GreyD", albumMap, 245, 1450000, "/media/image/cohenvoithanhxuan.jpg", "/media/audio/cohenvoithanhxuan.mp3", "/media/video/cohenvoithanhxuan.mp4", now.AddDays(-25));
        await AddMediaIfMissingAsync(context, user1.Id, "Come My Way", "Sơn Tùng M-TP", albumMap, 268, 920000, "/media/image/comemyway.jpg", "/media/audio/comemyway.mp3", "/media/video/comemyway.mp4", now.AddDays(-22));
        await AddMediaIfMissingAsync(context, user1.Id, "Em Thua Cô Ta", "Min Quỳnh Anh", albumMap, 232, 1100000, "/media/image/emthuacota.jpg", "/media/audio/emthuacota.mp3", "/media/video/emthuacota.mp4", now.AddDays(-20));
        await AddMediaIfMissingAsync(context, user1.Id, "Không Thể Say", "HIEUTHUHAI", albumMap, 255, 1850000, "/media/image/khongthesay.jpg", "/media/audio/khongthesay.mp3", "/media/video/khongthesay.mp4", now.AddDays(-18));
        await AddMediaIfMissingAsync(context, user1.Id, "Waiting For You", "MONO", albumMap, 241, 1350000, "/media/image/waitingforyou.jpg", "/media/audio/waitingforyou.mp3", "/media/video/waitingforyou.mp4", now.AddDays(-15));
        await AddMediaIfMissingAsync(context, user1.Id, "Có Chàng Trai Viết Lên Cây", "Phan Mạnh Quỳnh", albumMap, 273, 780000, "/media/image/cochangtrai.jpg", "/media/audio/cochangtrai.mp3", "/media/video/cochangtrai.mp4", now.AddDays(-12));
        await AddMediaIfMissingAsync(context, user1.Id, "Thiệp Hồng Sai Tên", "Nguyễn Thành Đạt", albumMap, 238, 950000, "/media/image/thiephongsaiten.jpg", "/media/audio/thiephongsaiten.mp3", "/media/video/thiephongsaiten.mp4", now.AddDays(-10));

        await context.SaveChangesAsync();

        await UpdateMissingGenresAsync(context, now);

        await AssignMissingAlbumsForAllMediaAsync(context, now);
        await SeedPlaylistsAsync(context, user1.Id, now);
        await context.SaveChangesAsync();

        Console.WriteLine($">>> Seed data thành công! Login: tampham@gmail.com / {SeedPassword}");
    }

    private static async Task CreateUserProfileIfNotExistsAsync(ApplicationDbContext context, string userId, string fullName, DateTime now)
    {
        if (await context.UserProfiles.AnyAsync(x => x.UserId == userId))
            return;

        context.UserProfiles.Add(new UserProfile
        {
            UserId = userId,
            FullName = fullName,
            PrivacyLevel = "Public",
            CreatedAt = now,
            UpdatedAt = now
        });
    }

    private static async Task<Artist> EnsureArtistAsync(ApplicationDbContext context, string name, DateTime now)
    {
        var artist = await context.Artists.FirstOrDefaultAsync(a => a.Name == name);

        if (artist != null)
        {
            if (string.IsNullOrWhiteSpace(artist.Slug))
                artist.Slug = SlugHelper.GenerateSlug(name);

            if (artist.UpdatedAt == default)
                artist.UpdatedAt = now;

            return artist;
        }

        artist = new Artist
        {
            Name = name,
            Slug = SlugHelper.GenerateSlug(name),
            CreatedAt = now,
            UpdatedAt = now
        };

        context.Artists.Add(artist);
        await context.SaveChangesAsync();

        return artist;
    }

    private static async Task<Album> EnsureAlbumAsync(
        ApplicationDbContext context,
        int artistId,
        string title,
        string description,
        string coverImageUrl,
        string albumType,
        DateTime now)
    {
        var slug = SlugHelper.GenerateSlug(title);

        var album = await context.Albums
            .FirstOrDefaultAsync(a => a.ArtistId == artistId && (a.Title == title || a.Slug == slug));

        if (album != null)
        {
            if (string.IsNullOrWhiteSpace(album.Slug))
                album.Slug = slug;

            if (string.IsNullOrWhiteSpace(album.Description))
                album.Description = description;

            if (string.IsNullOrWhiteSpace(album.CoverImageUrl))
                album.CoverImageUrl = coverImageUrl;

            if (string.IsNullOrWhiteSpace(album.AlbumType))
                album.AlbumType = albumType;

            album.UpdatedAt = now;
            return album;
        }

        album = new Album
        {
            ArtistId = artistId,
            Title = title,
            Slug = slug,
            Description = description,
            CoverImageUrl = coverImageUrl,
            ReleaseDate = now.Date,
            AlbumType = albumType,
            CreatedAt = now,
            UpdatedAt = now
        };

        context.Albums.Add(album);
        await context.SaveChangesAsync();

        return album;
    }

    private static async Task AddMediaIfMissingAsync(
        ApplicationDbContext context,
        string ownerUserId,
        string title,
        string artistName,
        Dictionary<string, Album> albumMap,
        int durationSeconds,
        int playCount,
        string thumbnailUrl,
        string audioFilePath,
        string videoFilePath,
        DateTime createdAt)
    {
        var artist = await context.Artists.FirstOrDefaultAsync(a => a.Name == artistName);
        if (artist == null)
            return;

        var exists = await context.MediaItems.AnyAsync(m => m.Title == title && m.ArtistId == artist.ArtistId);
        if (exists)
            return;

        albumMap.TryGetValue(artistName, out var album);

        context.MediaItems.Add(new MediaItem
        {
            OwnerUserId = ownerUserId,
            ArtistId = artist.ArtistId,
            AlbumId = album?.AlbumId,
            Title = title,
            VideoTitle = $"{title} MV",
            Slug = SlugHelper.GenerateSlug(title),
            Description = $"Bài hát {title} của {artistName}",
            MediaType = "Audio",
            Genre = GetDefaultGenre(title),
            DurationSeconds = durationSeconds,
            FilePath = audioFilePath,
            AudioFilePath = audioFilePath,
            VideoFilePath = videoFilePath,
            ThumbnailUrl = thumbnailUrl,
            MimeType = "audio/mpeg",
            Visibility = "Public",
            PlayCount = playCount,
            IsProcessed = true,
            CreatedAt = createdAt,
            UpdatedAt = createdAt
        });
    }


    private static string GetDefaultGenre(string title)
    {
        return title.Trim() switch
        {
            "Mang Tiền Về Cho Mẹ" => "Rap",
            "Không Thể Say" => "Rap",
            "See Tình" => "EDM / Dance",
            "Lạ Lùng" => "Indie",
            "Có Hẹn Với Thanh Xuân" => "Ballad",
            "Nơi Này Có Anh" => "Ballad",
            "Sau Tất Cả" => "Ballad",
            "Em Thua Cô Ta" => "Ballad",
            "Thiệp Hồng Sai Tên" => "Ballad",
            "Waiting For You" => "V-Pop",
            "Come My Way" => "V-Pop",
            "Có Chàng Trai Viết Lên Cây" => "Ballad",
            "Chúng Ta Chỉ Là Những Đứa Trẻ"=>"Rap",
            "MASHUP ROCK THIỆP HỒNG"=>"Rock",
            _ => "V-Pop"
        };
    }

    private static async Task UpdateMissingGenresAsync(ApplicationDbContext context, DateTime now)
    {
        var seededTitles = new[]
        {
            "Nơi Này Có Anh",
            "Lạ Lùng",
            "Mang Tiền Về Cho Mẹ",
            "See Tình",
            "Sau Tất Cả",
            "Có Hẹn Với Thanh Xuân",
            "Come My Way",
            "Em Thua Cô Ta",
            "Không Thể Say",
            "Waiting For You",
            "Có Chàng Trai Viết Lên Cây",
            "Thiệp Hồng Sai Tên"
        };

        var mediaItems = await context.MediaItems
            .Where(m => seededTitles.Contains(m.Title) && string.IsNullOrWhiteSpace(m.Genre))
            .ToListAsync();

        foreach (var media in mediaItems)
        {
            media.Genre = GetDefaultGenre(media.Title);
            media.UpdatedAt = now;
        }

        await context.SaveChangesAsync();
    }

    private static async Task AssignMissingAlbumsForAllMediaAsync(ApplicationDbContext context, DateTime now)
    {
        var mediaWithoutAlbum = await context.MediaItems
            .Where(m => m.AlbumId == null && m.ArtistId != null)
            .ToListAsync();

        if (!mediaWithoutAlbum.Any())
            return;

        var artistIds = mediaWithoutAlbum.Select(m => m.ArtistId!.Value).Distinct().ToList();

        var artists = await context.Artists
            .Where(a => artistIds.Contains(a.ArtistId))
            .ToDictionaryAsync(a => a.ArtistId);

        foreach (var mediaGroup in mediaWithoutAlbum.GroupBy(m => m.ArtistId!.Value))
        {
            if (!artists.TryGetValue(mediaGroup.Key, out var artist))
                continue;

            var album = await EnsureAlbumAsync(
                context,
                artist.ArtistId,
                $"{artist.Name} Collection",
                $"Tuyển tập các bài hát của {artist.Name}",
                DefaultAlbumCover,
                "Compilation",
                now
            );

            foreach (var media in mediaGroup)
            {
                media.AlbumId = album.AlbumId;

                if (string.IsNullOrWhiteSpace(media.VideoTitle) && !string.IsNullOrWhiteSpace(media.VideoFilePath))
                    media.VideoTitle = $"{media.Title} MV";

                if (string.IsNullOrWhiteSpace(media.Slug))
                    media.Slug = SlugHelper.GenerateSlug(media.Title);

                media.UpdatedAt = now;
            }
        }

        await context.SaveChangesAsync();
    }

    private static async Task SeedPlaylistsAsync(ApplicationDbContext context, string ownerUserId, DateTime now)
    {
        var allMedia = await context.MediaItems.OrderBy(x => x.MediaItemId).ToListAsync();
        if (!allMedia.Any())
            return;

        var playlist1 = await EnsurePlaylistAsync(
            context,
            ownerUserId,
            "V-Pop Hay Nhất 2025",
            "Tuyển tập các bài hát V-Pop nổi bật",
            "/media/image/vpop.jpg",
            now
        );

        await EnsurePlaylistAsync(
            context,
            ownerUserId,
            "Rap Việt",
            "Các bài rap hot nhất",
            "/media/image/rap.jpg",
            now
        );

        var hasPlaylist1Tracks = await context.PlaylistTracks.AnyAsync(pt => pt.PlaylistId == playlist1.PlaylistId);

        if (!hasPlaylist1Tracks)
        {
            var tracks = new List<PlaylistTrack>();
            var position = 1;

            foreach (var media in allMedia.Take(7))
            {
                tracks.Add(new PlaylistTrack
                {
                    PlaylistId = playlist1.PlaylistId,
                    MediaItemId = media.MediaItemId,
                    AddedByUserId = ownerUserId,
                    Position = position++,
                    AddedAt = now
                });
            }

            await context.PlaylistTracks.AddRangeAsync(tracks);
        }
    }

    private static async Task<Playlist> EnsurePlaylistAsync(
        ApplicationDbContext context,
        string ownerUserId,
        string title,
        string description,
        string coverImageUrl,
        DateTime now)
    {
        var playlist = await context.Playlists
            .FirstOrDefaultAsync(p => p.OwnerUserId == ownerUserId && p.Title == title);

        if (playlist != null)
        {
            if (string.IsNullOrWhiteSpace(playlist.Description))
                playlist.Description = description;

            if (string.IsNullOrWhiteSpace(playlist.CoverImageUrl))
                playlist.CoverImageUrl = coverImageUrl;

            playlist.Visibility = "Public";
            playlist.UpdatedAt = now;

            return playlist;
        }

        playlist = new Playlist
        {
            OwnerUserId = ownerUserId,
            Title = title,
            Description = description,
            Visibility = "Public",
            CoverImageUrl = coverImageUrl,
            CreatedAt = now,
            UpdatedAt = now
        };

        await context.Playlists.AddAsync(playlist);
        await context.SaveChangesAsync();

        return playlist;
    }

    private static async Task<ApplicationUser> CreateUserIfNotExistsAsync(
        UserManager<ApplicationUser> userManager,
        string username,
        string email,
        string displayName)
    {
        var user = await userManager.FindByEmailAsync(email) ?? await userManager.FindByNameAsync(username);

        if (user != null)
        {
            var changed = false;

            if (string.IsNullOrWhiteSpace(user.DisplayName))
            {
                user.DisplayName = displayName;
                changed = true;
            }

            if (!user.EmailConfirmed)
            {
                user.EmailConfirmed = true;
                changed = true;
            }

            if (changed)
            {
                user.UpdatedAt = DateTime.UtcNow;
                await userManager.UpdateAsync(user);
            }

            return user;
        }

        user = new ApplicationUser
        {
            UserName = username,
            Email = email,
            EmailConfirmed = true,
            DisplayName = displayName,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        var result = await userManager.CreateAsync(user, SeedPassword);

        if (!result.Succeeded)
        {
            var errors = string.Join(", ", result.Errors.Select(e => e.Description));
            throw new Exception($"Seed user {username} failed: {errors}");
        }

        return user;
    }
}
