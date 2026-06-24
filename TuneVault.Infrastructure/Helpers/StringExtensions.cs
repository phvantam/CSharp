using System.Globalization;
using System.Text;

namespace TuneVault.Infrastructure.Helpers;

public static class StringExtensions
{
    public static string RemoveDiacritics(this string text)
    {
        if (string.IsNullOrWhiteSpace(text)) return "";
        var normalizedString = text.Normalize(NormalizationForm.FormD);
        var sb = new StringBuilder(normalizedString.Length);
        foreach (var c in normalizedString)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                sb.Append(c);
        }
        return sb.ToString().Normalize(NormalizationForm.FormC).Replace("đ", "d").Replace("Đ", "D");
    }

    public static bool FuzzyMatch(string query, params string?[] fields)
    {
        if (string.IsNullOrWhiteSpace(query)) return true;
        var cleanQuery = query.RemoveDiacritics().ToLowerInvariant();
        var tokens = cleanQuery.Split(' ', StringSplitOptions.RemoveEmptyEntries);
        if (tokens.Length == 0) return true;
        var combined = string.Join(" ", fields.Select(f => (f ?? "").RemoveDiacritics().ToLowerInvariant()));
        return tokens.All(token => combined.Contains(token));
    }
}
