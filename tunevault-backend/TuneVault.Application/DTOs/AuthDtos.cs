namespace TuneVault.Application.Auth
{
    public class LoginRequest
    {
        public string Username { get; set; } = default!;
        public string Password { get; set; } = default!;
    }

    public class AuthResponseDto
    {
        public string Id { get; set; } = default!;
        public string Username { get; set; } = default!;
        public string DisplayName { get; set; } = default!;
        public string Token { get; set; } = default!;
    }
}