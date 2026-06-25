namespace TuneVault.Application.DTOs.Media;

public class PlayHistoryDto
{
    public long MediaItemId { get; set; }
    public string Title { get; set; } = string.Empty;
    public DateTime PlayedAt { get; set; }
    public int ProgressSeconds { get; set; }
}