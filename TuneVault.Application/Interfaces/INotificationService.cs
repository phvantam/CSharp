namespace TuneVault.Application.Interfaces;

public interface INotificationService
{
    Task PushAsync(string userId, string title, string message);
}