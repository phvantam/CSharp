using Microsoft.AspNetCore.Mvc;
using MediatR;
using TuneVault.Application.AI;
using TuneVault.Application.AI.Commands.ChatWithAI;
using TuneVault.Application.AI.Queries.GetAIRecommendations;

namespace TuneVault.API.Controllers;

[ApiController]
[Route("api/ai")]
public class AiController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IOpenRouterService _openRouterService;

    public AiController(
        IMediator mediator,
        IOpenRouterService openRouterService)
    {
        _mediator = mediator;
        _openRouterService = openRouterService;
    }

    [HttpPost("chat")]
    public async Task<IActionResult> Chat([FromBody] ChatRequest request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(new { error = "Message không được để trống" });

        var reply = await _mediator.Send(new ChatWithAICommand(request.Message));
        return Ok(new { reply });
    }

    [HttpPost("chat/stream")]
    public async Task StreamChat(
        [FromBody] ChatRequest request,
        CancellationToken cancellationToken)
    {
        Response.StatusCode = StatusCodes.Status200OK;
        Response.ContentType = "text/event-stream; charset=utf-8";
        Response.Headers["Cache-Control"] = "no-cache, no-transform";
        Response.Headers["Connection"] = "keep-alive";
        Response.Headers["X-Accel-Buffering"] = "no";

        if (request == null || string.IsNullOrWhiteSpace(request.Message))
        {
            await WriteSseDataAsync("Bạn chưa nhập tin nhắn.", cancellationToken);
            await WriteSseDoneAsync(cancellationToken);
            return;
        }

        var systemPrompt = """
            Bạn là Music Assistant của TuneVault - nền tảng streaming nhạc và video.

            PHONG CÁCH TRẢ LỜI:
            - Thân thiện, hiện đại, chuyên nghiệp.
            - Trả lời bằng tiếng Việt tự nhiên.
            - Trả lời ngắn gọn, dễ đọc, tối đa 10 dòng.
            - Có thể dùng markdown: **in đậm** tên bài hát hoặc nghệ sĩ.
            - Không dùng gạch đầu dòng, có thể đánh số thứ tự.

            QUY TẮC VỀ KHO MEDIA:
            - Người dùng có thể gửi kèm danh sách bài hát hiện có trong TuneVault.
            - Chỉ nói TuneVault có bài hát nếu bài đó nằm trong danh sách kho media được cung cấp.
            - Nếu người dùng hỏi bài hát, nghệ sĩ hoặc thể loại mà TuneVault chưa có, phải nói rõ:
              "Hiện tại TuneVault chưa có các bài hát đó."
            - Sau đó có thể đề xuất một vài bài hát ngoài web thật để người dùng tham khảo.
            - Với bài hát tham khảo ngoài TuneVault, ghi rõ là "tham khảo bên ngoài TuneVault".
            - Không bịa đặt rằng bài hát đang có trên TuneVault nếu không thấy trong danh sách kho media.
            """;

        var fullPrompt = $"{systemPrompt}\n\n{request.Message}";

        try
        {
            await foreach (var chunk in _openRouterService.StreamCompleteAsync(
                fullPrompt,
                cancellationToken))
            {
                await WriteSseDataAsync(chunk, cancellationToken);
            }

            await WriteSseDoneAsync(cancellationToken);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AI STREAM ERROR] {ex.Message}");

            var lowerError = ex.Message.ToLowerInvariant();

            var message =
                lowerError.Contains("429") ||
                lowerError.Contains("rate limit") ||
                lowerError.Contains("rate-limited") ||
                lowerError.Contains("free-models-per-day")
                    ? "AI đang tạm bị giới hạn lượt dùng từ OpenRouter. Bạn thử lại sau hoặc đổi model khác nhé."
                    : "Đã xảy ra lỗi khi kết nối với trợ lý AI. Vui lòng thử lại sau.";

            await WriteSseDataAsync(message, cancellationToken);
            await WriteSseDoneAsync(cancellationToken);
        }
    }

    [HttpGet("recommendations")]
    public async Task<IActionResult> GetRecommendations([FromQuery] string? userId = null)
    {
        var recommendations = await _mediator.Send(
            new GetAIRecommendationsQuery(userId ?? "guest")
        );

        return Ok(recommendations);
    }

    // Gửi plain UTF-8 thay vì JsonSerializer.Serialize để Swagger không hiện \u1EC7n.
    // Nếu chunk có xuống dòng, SSE cần mỗi dòng có prefix data:.
    private async Task WriteSseDataAsync(string data, CancellationToken cancellationToken)
    {
        data = data
            .Replace("\r\n", "\n")
            .Replace("\r", "\n");

        var lines = data.Split('\n');

        foreach (var line in lines)
        {
            await Response.WriteAsync($"data: {line}\n", cancellationToken);
        }

        await Response.WriteAsync("\n", cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);
    }

    private async Task WriteSseDoneAsync(CancellationToken cancellationToken)
    {
        await Response.WriteAsync("data: [DONE]\n\n", cancellationToken);
        await Response.Body.FlushAsync(cancellationToken);
    }
}

public class ChatRequest
{
    public string Message { get; set; } = string.Empty;
}
