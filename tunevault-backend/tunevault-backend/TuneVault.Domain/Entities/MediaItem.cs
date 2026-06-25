using System;

namespace TuneVault.Domain.Entities
{
	public class MediaItem
	{
		public long MediaItemId { get; set; }
		public string OwnerUserId { get; set; } = string.Empty;
		public int ArtistId { get; set; }
		public int? AlbumId { get; set; }
		public string Title { get; set; } = string.Empty;
		public string Slug { get; set; } = string.Empty;
		public string Description { get; set; } = string.Empty;
		// 'Audio' or 'Video'
		public string MediaType { get; set; } = string.Empty;
		public string Genre { get; set; } = string.Empty;
		public int DurationSeconds { get; set; }
		// Physical or virtual path to file, e.g. /media/videos/... or C:\\media\\...
		public string FilePath { get; set; } = string.Empty;
		public string MimeType { get; set; } = string.Empty;
		public long FileSizeBytes { get; set; }
		public string Visibility { get; set; } = string.Empty;
		public int PlayCount { get; set; }
		public bool IsProcessed { get; set; }
		public DateTime CreatedAt { get; set; }
		public DateTime UpdatedAt { get; set; }
	}
}
