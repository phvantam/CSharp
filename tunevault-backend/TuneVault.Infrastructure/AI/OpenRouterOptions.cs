namespace TuneVault.Infrastructure.AI;

public class OpenRouterOptions
{
    public string ApiKey { get; set; } = string.Empty;

    // Có thể đổi model trong appsettings.json nếu model hiện tại hết free/quota
    public string Model { get; set; } = "openai/gpt-oss-120b:free";

    public string HttpReferer { get; set; } = "http://localhost:5173";
    public string XTitle { get; set; } = "TuneVault";

    public double Temperature { get; set; } = 0.7;
    public int MaxTokens { get; set; } = 600;
}
