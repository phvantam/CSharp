namespace TuneVault.Domain.Entities;

public class Share
{
    public Guid Id { get; set; }
    public Guid SenderUserId { get; set; }
    public Guid ReceiverUserId { get; set; }
    public Guid? MediaItemId { get; set; }
    public Guid? PlaylistId { get; set; }
    public string? Message { get; set; }
    public DateTime SharedAt { get; set; } = DateTime.UtcNow;
}