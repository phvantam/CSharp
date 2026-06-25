namespace TuneVault.Application.Common;

public static class AllowedFileTypes
{
    public static readonly Dictionary<string, string[]> AllowedExtensions = new()
    {
        { "Audio", new[] { ".mp3", ".wav", ".m4a", ".aac" } },
        { "Video", new[] { ".mp4", ".webm", ".mov" } },
        { "Image", new[] { ".jpg", ".jpeg", ".png", ".webp" } }
    };

    public static readonly Dictionary<string, string> AllowedMimeTypes = new()
    {
        { ".mp3", "audio/mpeg" },
        { ".wav", "audio/wav" },
        { ".m4a", "audio/mp4" },
        { ".aac", "audio/aac" },
        { ".mp4", "video/mp4" },
        { ".webm", "video/webm" },
        { ".mov", "video/quicktime" },
        { ".jpg", "image/jpeg" },
        { ".jpeg", "image/jpeg" },
        { ".png", "image/png" },
        { ".webp", "image/webp" }
    };
}