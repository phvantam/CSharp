namespace TuneVault.Domain.Entities;

public class Playlist
{
    public Guid Id { get; set; }
    
    public string Name { get; set; } = null!;
    public string Title 
    { 
        get => Name; 
        set => Name = value; 
    }
    
    public string Description { get; set; } = null!;
    public string? CoverImageUrl { get; set; }
    
    // SỬA TẠI ĐÂY: Đổi sang kiểu Guid để khớp với các file Command/Query cũ
    public Guid UserId { get; set; } 
    public Guid OwnerUserId 
    { 
        get => UserId; 
        set => UserId = value; 
    }
    
    public DateTime CreatedAt { get; set; }
}