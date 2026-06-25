public class LoginDto
{
    public string LoginIdentifier { get; set; } = string.Empty; // Có thể là Email hoặc Username
    public string Password { get; set; } = string.Empty;
}