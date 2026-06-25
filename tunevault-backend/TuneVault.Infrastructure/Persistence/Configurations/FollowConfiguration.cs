using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using TuneVault.Domain.Entities;

namespace TuneVault.Infrastructure.Persistence.Configurations;

public class FollowConfiguration : IEntityTypeConfiguration<Follow>
{
    public void Configure(EntityTypeBuilder<Follow> builder)
    {
        // Follower → ApplicationUser
        builder.HasOne(f => f.Follower)
               .WithMany(u => u.Following)
               .HasForeignKey(f => f.FollowerUserId)
               .OnDelete(DeleteBehavior.Restrict);

        // TargetUser → ApplicationUser (nếu follow user)
        builder.HasOne(f => f.TargetUser)
               .WithMany(u => u.Followers)
               .HasForeignKey(f => f.TargetUserId)
               .OnDelete(DeleteBehavior.Restrict);

        // TargetArtist (nếu follow artist)
        builder.HasOne(f => f.TargetArtist)
               .WithMany()
               .HasForeignKey(f => f.TargetArtistId)
               .OnDelete(DeleteBehavior.Restrict);

        // Check Constraint
        builder.ToTable(t => t.HasCheckConstraint("CK_Follow_OneTarget",
            "([TargetUserId] IS NOT NULL AND [TargetArtistId] IS NULL) OR ([TargetUserId] IS NULL AND [TargetArtistId] IS NOT NULL)"));

        builder.HasIndex(f => f.FollowerUserId);
    }
}