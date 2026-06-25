namespace TuneVault.Domain.Interfaces;

public interface IFileStorageService
{
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string subfolder = "");
    Task<(Stream Stream, string ContentType)> GetFileAsync(string filePath);
    Task<bool> DeleteFileAsync(string filePath);
    string GetUploadsRoot();
}
