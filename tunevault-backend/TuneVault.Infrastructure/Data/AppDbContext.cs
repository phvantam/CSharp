using Microsoft.EntityFrameworkCore;
using TuneVault.Domain.Entities;


namespace TuneVault.Infrastructure.Data 
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; } = default!;
        public DbSet<MediaItem> MediaItems { get; set; } = default!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>().ToTable("AspNetUsers").HasKey(u => u.Id);

            // Map MediaItem to existing dbo.MediaItem table
            modelBuilder.Entity<MediaItem>()
                .ToTable("MediaItem")
                .HasKey(m => m.MediaItemId);

            // Map properties explicitly if DB column names/types differ from conventions.
            // Minimal mapping kept because the DB already exists and matches property names.
        }
    }
}