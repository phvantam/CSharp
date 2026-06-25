using MediatR;
using TuneVault.Application.AI;
using TuneVault.Application.AI.Queries.GetAIRecommendations;

namespace TuneVault.Application.AI.Queries.GetAIRecommendations;

public class GetAIRecommendationsQueryHandler : IRequestHandler<GetAIRecommendationsQuery, List<string>>
{
    private readonly IOpenRouterService _openRouterService;

    public GetAIRecommendationsQueryHandler(IOpenRouterService openRouterService)
    {
        _openRouterService = openRouterService;
    }

    public async Task<List<string>> Handle(GetAIRecommendationsQuery query, CancellationToken cancellationToken)
{
    var prompt = """
        Bạn là AI Recommendation Engine của TuneVault - nền tảng streaming nhạc chuyên nghiệp.

        NHIỆM VỤ: Gợi ý bài hát chất lượng cao cho người dùng.

        YÊU CẦU:
        - Có thể gợi ý từ 5 đến 15 bài hát.
        - Mỗi bài hát đều xuống dòng nên có **tên bài** và **nghệ sĩ**.
        - Có thể dùng **in đậm** cho tên bài hát hoặc *in nghiêng* nếu cần nhấn mạnh.
        - Được phép đánh số (1., 2., ...).
        - Có thể (hoặc không cần) giải thích ngắn gọn về giai điệu hoặc cảm xúc của bài hát.
        - Có thể có giới thiệu ngắn ở đầu (ví dụ: "Dưới đây là một số bài hát mình nghĩ bạn sẽ thích:").

        VÍ DỤ OUTPUT TỐT:
        Dưới đây là một số bài hát mình nghĩ bạn sẽ thích:

        1. **Nơi Này Có Anh** - Sơn Tùng M-TP: Bài hát với giai điệu tươi sáng, năng lượng tích cực.
        2. **Lạ Lùng** - Vũ.: Mang âm hưởng indie nhẹ nhàng, sâu lắng.
        3. **Mang Tiền Về Cho Mẹ** - Đen: Giai điệu ballad ấm áp, lời ca ý nghĩa.

        VÍ DỤ OUTPUT KHÔNG TỐT:
        - Chỉ liệt kê tên bài mà không có nghệ sĩ.
        - Giải thích quá dài dòng.
        - Không có cấu trúc rõ ràng.
        """;

    try
    {
        var result = await _openRouterService.CompleteAsync(prompt, cancellationToken);

        if (string.IsNullOrWhiteSpace(result))
            return GetDefaultRecommendations();

        // Tách thành từng dòng và làm sạch
        var recommendations = result
            .Split('\n', StringSplitOptions.RemoveEmptyEntries)
            .Select(line => line.Trim())
            .Where(line => line.Length > 5)
            .Take(8)
            .ToList();

        return recommendations.Count >= 3 ? recommendations : GetDefaultRecommendations();
    }
    catch
    {
        return GetDefaultRecommendations();
    }
}
// ==================== HÀM FALLBACK ====================
    private List<string> GetDefaultRecommendations()
    {
        return new List<string>
        { 
            "Nơi Này Có Anh - Sơn Tùng M-TP",
            "Lạ Lùng - Vũ.",
            "Mang Tiền Về Cho Mẹ - Đen",
            "See Tình - Hoàng Thùy Linh",
            "Không Thể Say - HIEUTHUHAI",
            "Waiting For You - MONO",
            "Come My Way - Sơn Tùng M-TP",
            "Có Hẹn Với Thanh Xuân - MONSTAR, GREY D",
            "Sau Tất Cả - ERIK",
            "Có Chàng Trai Viết Lên Cây - Phan Mạnh Quỳnh",
            "Thiệp Hồng Sai Tên - Nguyễn Thành Đạt",
            "Em Thua Cô Ta - Min Quỳnh Anh",
            "Chúng Ta Của Hiện Tại - Sơn Tùng M-TP",
            "Muộn Rồi Mà Sao Còn - Sơn Tùng M-TP",
            "Bước Qua Nhau - Vũ.",
            "Đưa Nhau Đi Trốn - Đen, Linh Cáo",
            "Bài Này Chill Phết - Đen, MIN",
            "Lối Nhỏ - Đen, Phương Anh Đào",
            "Em Không Sai Chúng Ta Sai - ERIK",
            "Chạm Đáy Nỗi Đau - ERIK",
            "Có Tất Cả Nhưng Thiếu Anh - ERIK",
            "Thích Em Hơi Nhiều - Wren Evans",
            "Từng Quen - Wren Evans",
            "Nàng Thơ - Hoàng Dũng",
            "Hơn Cả Yêu - Đức Phúc",
            "Ánh Nắng Của Anh - Đức Phúc",
            "Phía Sau Một Cô Gái - Soobin Hoàng Sơn",
            "Một Đêm Say - Thịnh Suy",
            "Bên Trên Tầng Lầu - Tăng Duy Tân",
            "Cắt Đôi Nỗi Sầu - Tăng Duy Tân",
            "Không Phải Gu - HIEUTHUHAI",
            "Ngủ Một Mình - HIEUTHUHAI",
            "Em Là - MONO",
            "Quên Anh Đi - MONO"
        };
    }
}