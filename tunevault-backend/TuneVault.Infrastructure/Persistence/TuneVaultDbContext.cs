using Microsoft.EntityFrameworkCore;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence;

public class TuneVaultDbContext : DbContext
{
    public TuneVaultDbContext(DbContextOptions<TuneVaultDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<MediaItem> MediaItems => Set<MediaItem>();
    public DbSet<Playlist> Playlists => Set<Playlist>();
    public DbSet<PlaylistItem> PlaylistItems => Set<PlaylistItem>();
    public DbSet<Share> Shares => Set<Share>();
    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ==========================================
        // 1. CẤU HÌNH BẢNG USERS
        // ==========================================
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.HasIndex(u => u.Email).IsUnique(); // Chặn trùng Email ở tầng Database
            entity.Property(u => u.Email).HasMaxLength(150).IsRequired();
            entity.Property(u => u.DisplayName).HasMaxLength(100).IsRequired();
        });

        // ==========================================
        // 2. CẤU HÌNH BẢNG MEDIAITEMS
        // ==========================================
        modelBuilder.Entity<MediaItem>(entity =>
        {
            entity.HasKey(m => m.Id);
            entity.HasOne<User>()
                  .WithMany()
                  .HasForeignKey(m => m.UserId)
                  .OnDelete(DeleteBehavior.Cascade); // Xóa User -> Tự động xóa MediaItem của User đó
        });

        // ==========================================
        // 3. CẤU HÌNH BẢNG PLAYLISTS
        // ==========================================
        modelBuilder.Entity<Playlist>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.HasOne<User>()
                  .WithMany()
                  .HasForeignKey(p => p.UserId)
                  .OnDelete(DeleteBehavior.Cascade); // Xóa User -> Tự động xóa Playlist của User đó
        });

        // ==========================================
        // 4. CẤU HÌNH BẢNG PLAYLISTITEM (Của bạn + Ràng buộc ngoại)
        // ==========================================
        modelBuilder.Entity<PlaylistItem>(entity =>
        {
            // GIỮ NGUYÊN: Thiết lập sự kết hợp giữa PlaylistId và MediaItemId làm Khóa Chính tổ hợp
            entity.HasKey(pi => new { pi.PlaylistId, pi.MediaItemId });

            // BỔ SUNG: Ràng buộc khóa ngoại an toàn
            entity.HasOne<Playlist>()
                  .WithMany()
                  .HasForeignKey(pi => pi.PlaylistId)
                  .OnDelete(DeleteBehavior.Cascade); // Xóa Playlist -> Xóa bản ghi trung gian

            entity.HasOne<MediaItem>()
                  .WithMany()
                  .HasForeignKey(pi => pi.MediaItemId)
                  .OnDelete(DeleteBehavior.Restrict); // Chặn xóa bài hát nếu bài hát đó đang nằm trong Playlist
        });

        // ==========================================
        // 5. CẤU HÌNH BẢNG SHARES (Giữ nguyên gốc của bạn + Thêm khóa ngoại Media)
        // ==========================================
        modelBuilder.Entity<Share>(entity =>
        {
            entity.HasKey(s => s.Id);
            
            // GIỮ NGUYÊN: Đoạn code chống lỗi Multiple Cascade Paths của bạn
            entity.HasOne<User>().WithMany().HasForeignKey(s => s.SenderUserId).OnDelete(DeleteBehavior.Restrict);
            entity.HasOne<User>().WithMany().HasForeignKey(s => s.ReceiverUserId).OnDelete(DeleteBehavior.Restrict);
            
            // BỔ SUNG: Liên kết ngoại tới Media được chia sẻ
            entity.HasOne<MediaItem>().WithMany().HasForeignKey(s => s.MediaItemId).OnDelete(DeleteBehavior.Cascade);
        });

        // ==========================================
        // 6. CẤU HÌNH BẢNG NOTIFICATIONS
        // ==========================================
        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(n => n.Id);
            entity.HasOne<User>()
                  .WithMany()
                  .HasForeignKey(n => n.UserId)
                  .OnDelete(DeleteBehavior.Cascade); // Xóa User -> Xóa sạch thông báo liên quan
        });
    }
}