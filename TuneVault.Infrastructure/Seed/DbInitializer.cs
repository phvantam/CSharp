using Microsoft.EntityFrameworkCore;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence.Seed;

public static class DbInitializer
{
    public static async Task SeedDataAsync(TuneVaultDbContext context)
    {
        // Kiểm tra xem ứng dụng đã chạy qua Migration chưa
        await context.Database.MigrateAsync();

        // Nếu bảng Users đã có dữ liệu -> Hệ thống đã được seed, bỏ qua không chạy tiếp
        if (await context.Users.AnyAsync()) return;

        // 1. Seed 2 Users mẫu (Password mặc định là "Password123")
        var user1Id = Guid.NewGuid();
        var user2Id = Guid.NewGuid();
        
        var users = new List<User>
        {
            new() { Id = user1Id, Email = "user1@tunevault.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"), DisplayName = "Anh Tuấn", CreatedAt = DateTime.UtcNow },
            new() { Id = user2Id, Email = "user2@tunevault.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123"), DisplayName = "Bảo Ngọc", CreatedAt = DateTime.UtcNow }
        };
        await context.Users.AddRangeAsync(users);

        // 2. Seed 10 Media Items (8 Audios + 2 Videos) - ĐÃ SỬA: Bổ sung UserId sở hữu
        var mediaItems = new List<MediaItem>();
        for (int i = 1; i <= 8; i++)
        {
            mediaItems.Add(new MediaItem 
            { 
                Id = Guid.NewGuid(), 
                Title = $"Song Track 0{i}", 
                Url = $"https://storage.tunevault.com/audios/track0{i}.mp3", 
                MediaType = "Audio", 
                Duration = 210, 
                UserId = i % 2 == 0 ? user1Id : user2Id, // Gán User sở hữu để tránh lỗi Null FK
                CreatedAt = DateTime.UtcNow 
            });
        }
        
        var video1Id = Guid.NewGuid();
        var video2Id = Guid.NewGuid();
        
        mediaItems.Add(new MediaItem { Id = video1Id, Title = "Live Concert Pop 2026", Url = "https://storage.tunevault.com/videos/concert.mp4", MediaType = "Video", Duration = 600, UserId = user1Id, CreatedAt = DateTime.UtcNow });
        mediaItems.Add(new MediaItem { Id = video2Id, Title = "Official Music Video Chill", Url = "https://storage.tunevault.com/videos/mv_chill.mp4", MediaType = "Video", Duration = 240, UserId = user2Id, CreatedAt = DateTime.UtcNow });
        
        await context.MediaItems.AddRangeAsync(mediaItems);

        // 3. Seed 2 Playlists (mỗi User sở hữu 1 cái)
        var playlist1Id = Guid.NewGuid();
        var playlist2Id = Guid.NewGuid();
        
        var playlists = new List<Playlist>
        {
            new() { Id = playlist1Id, UserId = user1Id, Name = "My Favorite Songs", Description = "Daily chill music playlist", CreatedAt = DateTime.UtcNow },
            new() { Id = playlist2Id, UserId = user2Id, Name = "Weekend Video Hits", Description = "High quality video collection", CreatedAt = DateTime.UtcNow }
        };
        await context.Playlists.AddRangeAsync(playlists);

        // Gắn vài bài hát vào bảng trung gian PlaylistItem
        var playlistItems = new List<PlaylistItem>
        {
            new() { PlaylistId = playlist1Id, MediaItemId = mediaItems[0].Id, AddedAt = DateTime.UtcNow },
            new() { PlaylistId = playlist1Id, MediaItemId = mediaItems[1].Id, AddedAt = DateTime.UtcNow },
            new() { PlaylistId = playlist2Id, MediaItemId = video1Id, AddedAt = DateTime.UtcNow }
        };
        await context.PlaylistItems.AddRangeAsync(playlistItems);

        // 4. Seed 1-2 Share Sample (User 1 share nhạc cho User 2)
        var shares = new List<Share>
        {
            new() { Id = Guid.NewGuid(), SenderUserId = user1Id, ReceiverUserId = user2Id, MediaItemId = mediaItems[0].Id, Message = "Nghe thử bài này cuốn lắm bạn ơi!", SharedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), SenderUserId = user1Id, ReceiverUserId = user2Id, PlaylistId = playlist1Id, Message = "Tặng bạn cả cái playlist tớ tự làm nè", SharedAt = DateTime.UtcNow }
        };
        await context.Shares.AddRangeAsync(shares);

        // 5. Seed 1-2 Notification Sample (Thông báo đẩy về hộp thư của User 2)
        var notifications = new List<Notification>
        {
            new() { Id = Guid.NewGuid(), UserId = user2Id, Title = "New share", Message = "Anh Tuấn shared a song with you", IsRead = false, CreatedAt = DateTime.UtcNow },
            new() { Id = Guid.NewGuid(), UserId = user2Id, Title = "New share", Message = "Anh Tuấn shared a playlist with you", IsRead = false, CreatedAt = DateTime.UtcNow }
        };
        await context.Notifications.AddRangeAsync(notifications);

        // Thực thi đẩy toàn bộ data xuống DB vật lý
        await context.SaveChangesAsync();
    }
}