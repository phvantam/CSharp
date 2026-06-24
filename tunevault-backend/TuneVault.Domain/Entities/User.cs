using System;

namespace TuneVault.Domain.Entities
{
    public class User
    {
        public string Id { get; set; } = default!;
        public string UserName { get; set; } = default!;
        public string NormalizedUserName { get; set; } = default!;
        public string Email { get; set; } = default!;
        public string NormalizedEmail { get; set; } = default!;
        public bool EmailConfirmed { get; set; }
        public string PasswordHash { get; set; } = default!;
        public string DisplayName { get; set; } = default!;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}