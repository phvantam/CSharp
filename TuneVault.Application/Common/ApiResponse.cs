namespace TuneVault.Application.Common;

public sealed record ApiResponse(bool Success, object? Data = null, string? Message = null, object? Meta = null)
{
    public static ApiResponse Ok(object? data, object? meta = null) => new(true, data, null, meta);
    public static ApiResponse Fail(string message) => new(false, null, message);
}
