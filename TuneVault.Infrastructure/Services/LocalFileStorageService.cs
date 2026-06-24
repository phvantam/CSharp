using TuneVault.Domain.Interfaces;

namespace TuneVault.Infrastructure.Services;

public sealed class LocalFileStorageService : IFileStorageService
{
    private readonly string _uploadsRoot;

    public LocalFileStorageService(string uploadsRoot)
    {
        _uploadsRoot = uploadsRoot;
        Directory.CreateDirectory(_uploadsRoot);
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string subfolder = "")
    {
        var targetDir = string.IsNullOrEmpty(subfolder) ? _uploadsRoot : Path.Combine(_uploadsRoot, subfolder);
        Directory.CreateDirectory(targetDir);

        var ext = Path.GetExtension(fileName);
        var saveName = $"{Guid.NewGuid()}{ext}";
        var filePath = Path.Combine(targetDir, saveName);

        await using var fs = File.Create(filePath);
        await fileStream.CopyToAsync(fs);

        return filePath;
    }

    public Task<(Stream Stream, string ContentType)> GetFileAsync(string filePath)
    {
        var fullPath = Path.GetFullPath(filePath);
        if (!File.Exists(fullPath))
            throw new FileNotFoundException("File not found", fullPath);

        var ext = Path.GetExtension(fullPath).ToLowerInvariant();
        var contentType = ext switch
        {
            ".mp3" => "audio/mpeg",
            ".wav" => "audio/wav",
            ".ogg" => "audio/ogg",
            ".mp4" => "video/mp4",
            ".webm" => "video/webm",
            ".mov" => "video/quicktime",
            ".avi" => "video/x-msvideo",
            ".mkv" => "video/x-matroska",
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            _ => "application/octet-stream"
        };

        return Task.FromResult<(Stream, string)>((File.OpenRead(fullPath), contentType));
    }

    public Task<bool> DeleteFileAsync(string filePath)
    {
        if (File.Exists(filePath))
        {
            File.Delete(filePath);
            return Task.FromResult(true);
        }
        return Task.FromResult(false);
    }

    public string GetUploadsRoot() => _uploadsRoot;
}
