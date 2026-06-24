using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace TuneVault.Domain.Entities;

public class Notification
{
    public long NotificationId { get; set; }

    public string UserId { get; set; } = null!;

    public string? ActorUserId { get; set; } = null!;

    public string Type { get; set; } = "System";

    public string Title { get; set; } = null!;

    public string? Body { get; set; }

    public string? PayloadJson { get; set; }

    public bool IsRead { get; set; }

    public DateTime? ReadAt { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual AppUser? ActorUser { get; set; }

    public virtual AppUser User { get; set; } = null!;

    // Helper property for backward compatibility (Not Mapped to DB)
    [NotMapped]
    public int? MediaShareId { get; set; }
}
