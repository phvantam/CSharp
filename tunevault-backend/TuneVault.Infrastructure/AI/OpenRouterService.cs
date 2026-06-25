using System.Runtime.CompilerServices;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using TuneVault.Application.AI;

namespace TuneVault.Infrastructure.AI;

public class OpenRouterService : IOpenRouterService
{
    private readonly HttpClient _http;
    private readonly OpenRouterOptions _options;

    public OpenRouterService(HttpClient http, IOptions<OpenRouterOptions> options)
    {
        _http = http;
        _options = options.Value;
    }

    public async Task<string> CompleteAsync(string prompt, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
            throw new InvalidOperationException("OpenRouter ApiKey chưa được cấu hình.");

        var body = new
        {
            model = _options.Model,
            messages = new[]
            {
                new
                {
                    role = "user",
                    content = prompt
                }
            },
            temperature = _options.Temperature,
            max_tokens = _options.MaxTokens
        };

        using var req = CreateOpenRouterRequest(body);

        using var res = await _http.SendAsync(req, ct);
        var raw = await res.Content.ReadAsStringAsync(ct);

        if (!res.IsSuccessStatusCode)
        {
            throw new InvalidOperationException(
                $"OpenRouter error {(int)res.StatusCode}: {raw}"
            );
        }

        var json = JsonSerializer.Deserialize<OpenRouterResponse>(raw);

        return json?.Choices?.FirstOrDefault()?.Message?.Content?.Trim()
               ?? string.Empty;
    }

    public async IAsyncEnumerable<string> StreamCompleteAsync(
        string prompt,
        [EnumeratorCancellation] CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(_options.ApiKey))
            throw new InvalidOperationException("OpenRouter ApiKey chưa được cấu hình.");

        var body = new
        {
            model = _options.Model,
            stream = true,
            messages = new[]
            {
                new
                {
                    role = "user",
                    content = prompt
                }
            },
            temperature = _options.Temperature,
            max_tokens = _options.MaxTokens
        };

        using var req = CreateOpenRouterRequest(body);

        using var res = await _http.SendAsync(
            req,
            HttpCompletionOption.ResponseHeadersRead,
            ct
        );

        if (!res.IsSuccessStatusCode)
        {
            var rawError = await res.Content.ReadAsStringAsync(ct);

            throw new InvalidOperationException(
                $"OpenRouter error {(int)res.StatusCode}: {rawError}"
            );
        }

        await using var stream = await res.Content.ReadAsStreamAsync(ct);
        using var reader = new StreamReader(stream, Encoding.UTF8);

        while (!ct.IsCancellationRequested)
        {
            var line = await reader.ReadLineAsync(ct);

            if (line == null)
                yield break;

            if (string.IsNullOrWhiteSpace(line))
                continue;

            // OpenRouter/OpenAI SSE format:
            // data: {"choices":[{"delta":{"content":"..."}}]}
            if (!line.StartsWith("data:", StringComparison.OrdinalIgnoreCase))
                continue;

            var data = line["data:".Length..].Trim();

            if (data == "[DONE]")
                yield break;

            StreamChunk? chunk;

            try
            {
                chunk = JsonSerializer.Deserialize<StreamChunk>(data);
            }
            catch
            {
                continue;
            }

            var content = chunk?.Choices?.FirstOrDefault()?.Delta?.Content;

            if (!string.IsNullOrEmpty(content))
                yield return content;
        }
    }

    private HttpRequestMessage CreateOpenRouterRequest(object body)
    {
        var req = new HttpRequestMessage(
            HttpMethod.Post,
            "https://openrouter.ai/api/v1/chat/completions"
        );

        req.Headers.TryAddWithoutValidation("Authorization", $"Bearer {_options.ApiKey}");
        req.Headers.TryAddWithoutValidation("HTTP-Referer", _options.HttpReferer);
        req.Headers.TryAddWithoutValidation("X-Title", _options.XTitle);

        req.Content = new StringContent(
            JsonSerializer.Serialize(body),
            Encoding.UTF8,
            "application/json"
        );

        return req;
    }

    private class OpenRouterResponse
    {
        [JsonPropertyName("choices")]
        public List<Choice>? Choices { get; set; }
    }

    private class Choice
    {
        [JsonPropertyName("message")]
        public Message? Message { get; set; }
    }

    private class Message
    {
        [JsonPropertyName("content")]
        public string? Content { get; set; }
    }

    private class StreamChunk
    {
        [JsonPropertyName("choices")]
        public List<StreamChoice>? Choices { get; set; }
    }

    private class StreamChoice
    {
        [JsonPropertyName("delta")]
        public StreamDelta? Delta { get; set; }
    }

    private class StreamDelta
    {
        [JsonPropertyName("content")]
        public string? Content { get; set; }
    }
}
