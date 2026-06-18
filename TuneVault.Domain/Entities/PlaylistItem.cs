namespace TuneVault.Domain.Entities;

public class PlaylistItem
{
    public Guid PlaylistId { get; set; }
    public Guid MediaItemId { get; set; }
    public DateTime AddedAt { get; set; }            // Thêm dòng này nếu chưa có
}