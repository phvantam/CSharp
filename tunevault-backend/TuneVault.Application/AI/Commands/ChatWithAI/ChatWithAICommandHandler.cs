using MediatR;
using TuneVault.Application.AI;

namespace TuneVault.Application.AI.Commands.ChatWithAI;

public class ChatWithAICommandHandler : IRequestHandler<ChatWithAICommand, string>
{
    private readonly IOpenRouterService _openRouterService;

    public ChatWithAICommandHandler(IOpenRouterService openRouterService)
    {
        _openRouterService = openRouterService;
    }

    public async Task<string> Handle(
        ChatWithAICommand command,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(command.UserMessage))
            return "Bạn chưa nhập tin nhắn. Hãy cho mình biết bạn muốn nghe thể loại nhạc gì nhé!";

        var systemPrompt = """
            Bạn là Music Assistant của TuneVault - nền tảng streaming nhạc và video.

            PHONG CÁCH TRẢ LỜI:
            - Thân thiện,hiện đại, chuyên nghiệp.( Ví dụ: Đây là các bài hát tôi có thể gợi ý cho bạn ... . Bạn muốn nghe thể loại nhạc khác không)
            - Trả lời bằng tiếng Việt tự nhiên.
            - Trả lời ngắn gọn, dễ đọc, tối đa 10 dòng.
            - Có thể dùng markdown: **in đậm** tên bài hát hoặc nghệ sĩ.
            - Tập trung vào âm nhạc và trải nghiệm nghe nhạc.
            - Không dùng gạch đầu dòng, có thể đánh số thứ tự.

            QUY TẮC VỀ KHO MEDIA:
            - Người dùng có thể gửi kèm danh sách bài hát hiện có trong TuneVault.
            - Chỉ nói TuneVault có bài hát nếu bài đó nằm trong danh sách kho media được cung cấp.
            - Nếu người dùng hỏi bài hát, nghệ sĩ hoặc thể loại mà TuneVault chưa có, phải nói rõ:
              "Hiện tại TuneVault chưa có các bài hát đó."
            - Sau đó có thể đề xuất một vài bài hát ngoài web thật để người dùng tham khảo.
            - Với bài hát tham khảo ngoài TuneVault.
            - Không bịa đặt rằng bài hát đang có trên TuneVault nếu không thấy trong danh sách kho media.

            ĐỊNH DẠNG GỢI Ý:
            - Nếu là bài có trên TuneVault: **Tên bài** - Nghệ sĩ.
            - Nếu là bài tham khảo ngoài TuneVault: **Tên bài** - Nghệ sĩ.
            """;

        var fullPrompt = $"{systemPrompt}\n\n{command.UserMessage}";

        try
        {
            var reply = await _openRouterService.CompleteAsync(
                fullPrompt,
                cancellationToken
            );

            return string.IsNullOrWhiteSpace(reply)
                ? "Xin lỗi, hiện tại mình đang gặp chút vấn đề kỹ thuật. Bạn thử lại sau nhé!"
                : reply.Trim();
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AI ERROR] {ex.Message}");
            return "Đã xảy ra lỗi khi kết nối với trợ lý AI. Vui lòng thử lại sau.";
        }
    }
}
