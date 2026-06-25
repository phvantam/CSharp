using System.Text;
using System.Text.RegularExpressions;

namespace TuneVault.Application.Common;

public static class SlugHelper
{
    /// <summary>
    /// Tạo slug từ chuỗi (hỗ trợ tiếng Việt)
    /// </summary>
    public static string GenerateSlug(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            return string.Empty;

        // Chuyển về chữ thường
        string slug = input.ToLowerInvariant().Trim();

        // Loại bỏ dấu tiếng Việt
        slug = RemoveVietnameseAccents(slug);

        // Thay khoảng trắng bằng dấu gạch ngang
        slug = Regex.Replace(slug, @"\s+", "-");

        // Loại bỏ ký tự đặc biệt (chỉ giữ chữ, số, và dấu gạch ngang)
        slug = Regex.Replace(slug, @"[^a-z0-9\-]", "");

        // Loại bỏ nhiều dấu gạch ngang liên tiếp
        slug = Regex.Replace(slug, @"-+", "-");

        // Loại bỏ dấu gạch ngang ở đầu và cuối
        slug = slug.Trim('-');

        return slug;
    }

    private static string RemoveVietnameseAccents(string text)
    {
        string[] vietnameseSigns = new[]
        {
            "àáạảãâầấậẩẫăằắặẳẵ",
            "èéẹẻẽêềếệểễ",
            "ìíịỉĩ",
            "òóọỏõôồốộổỗơờớợởỡ",
            "ùúụủũưừứựửữ",
            "ỳýỵỷỹ",
            "đ"
        };

        string[] replacements = new[] { "a", "e", "i", "o", "u", "y", "d" };

        for (int i = 0; i < vietnameseSigns.Length; i++)
        {
            foreach (char c in vietnameseSigns[i])
            {
                text = text.Replace(c.ToString(), replacements[i]);
            }
        }

        return text;
    }
}