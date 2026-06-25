namespace TuneVault.Application.AI;

public interface IOpenRouterService
{
    Task<string> CompleteAsync(string prompt, CancellationToken ct = default);

    IAsyncEnumerable<string> StreamCompleteAsync(
        string prompt,
        CancellationToken ct = default
    );
}
