using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.EntityFrameworkCore;
using TuneVault.Infrastructure.Persistence.Seed;
using TuneVault.Application.Interfaces;
using TuneVault.Infrastructure.Services;
using TuneVault.Infrastructure.Hubs;
using TuneVault.Infrastructure.Persistence;
using Microsoft.OpenApi.Models;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// =========================================================================
// 1. ĐĂNG KÝ SERVICES (TẤT CẢ PHẢI NẰM TRƯỚC builder.Build())
// =========================================================================
builder.WebHost.UseWebRoot("wwwroot");
builder.Services.AddControllers(); 
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSignalR();

// [MỚI] Cấu hình CORS - Mở cổng kết nối an toàn cho ứng dụng Front-end React
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // Cổng chạy mặc định của React Vite
              .AllowAnyMethod()                     // Cho phép mọi phương thức GET, POST, PUT, DELETE...
              .AllowAnyHeader()                     // Cho phép truyền mọi Header (bao gồm cả Authorization Token)
              .AllowCredentials();                  // Cho phép gửi kèm Cookie/Thông tin định danh nếu cần
    });
});

// [NÂNG CẤP] Cấu hình Swagger UI hiển thị Tiếng Việt và nút khóa bảo mật JWT Token
builder.Services.AddSwaggerGen(options =>
{
    // Thông tin tiêu đề hiển thị trên giao diện Swagger
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Version = "v1",
        Title = "TuneVault API Hệ Thống",
        Description = "Tài liệu hướng dẫn và thử nghiệm các đầu API dành cho dự án TuneVault (.NET 10)"
    });

    // Kích hoạt tính năng đọc file XML để hiển thị ghi chú ba dấu xuyệt (///) dạng Tiếng Việt
    var xmlFilename = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFilename);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }

    // Thiết lập cấu hình nút "Authorize" hình ổ khóa để truyền Token JWT Bearer công khai
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập mã Token theo cấu trúc chuẩn: Bearer [chuỗi_token_của_bạn] (Lưu ý có dấu cách sau chữ Bearer)"
    });

    // Áp dụng cơ chế khóa bảo mật cho toàn bộ hệ thống API yêu cầu xác thực
    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Đăng ký các Repository vào DI Container
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IPlaylistRepository, PlaylistRepository>();
builder.Services.AddScoped<IShareRepository, ShareRepository>();
builder.Services.AddScoped<IMediaRepository, MediaRepository>();
builder.Services.AddScoped<INotificationRepository, NotificationRepository>();

// Đăng ký MediatR
builder.Services.AddMediatR(cfg =>
    cfg.RegisterServicesFromAssembly(
        typeof(TuneVault.Application.Features.Profile.Queries.GetCurrentProfileQuery).Assembly
    )
);

// Đăng ký DbContext với chuỗi kết nối SQL Server của bạn
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Server=.;Database=TuneVaultDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true";

builder.Services.AddDbContext<TuneVaultDbContext>(options =>
    options.UseSqlServer(connectionString));

// Cấu hình JWT Authentication
var secretKey = builder.Configuration["JwtSettings:Secret"] ?? "Thay_The_Bang_Chuoi_Key_Bi_Mat_Sieu_Dai_Cua_Ban_O_Day_Nhe";
var key = Encoding.UTF8.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false; 
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// Đăng ký các Service tự viết (Dependency Injection)
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

// =========================================================================
// 2. CHỐT CHẶN KHỞI TẠO ỨNG DỤNG
// =========================================================================
var app = builder.Build();
app.UseStaticFiles();
// =========================================================================
// 3. CẤU HÌNH MIDDLEWARE PIPELINE (TẤT CẢ NẰM SAU builder.Build())
// =========================================================================

// Khởi động giao diện hiển thị Swagger UI ở môi trường Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "TuneVault API v1");
    });
}

// Luồng tự động chạy Migration và nạp dữ liệu mẫu khi khởi động ứng dụng (Đã dọn dẹp chỉ chạy 1 lần duy nhất)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<TuneVaultDbContext>();
        await DbInitializer.SeedDataAsync(context); 
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Có lỗi xảy ra trong quá trình Migrate hoặc nạp dữ liệu mẫu Seed Data.");
    }
}

app.UseHttpsRedirection();

// ⚠️ QUAN TRỌNG: UseCors bắt buộc phải chạy TRƯỚC Authentication và Authorization
app.UseCors("AllowReactApp");

// Thứ tự chuẩn cho luồng Security bảo mật danh tính
app.UseAuthentication();
app.UseAuthorization();

// Cấu hình định tuyến Endpoint cho API và các Hub Realtime SignalR
app.MapControllers();
app.MapHub<NotificationHub>("/hubs/notification");

// Weather Forecast Endpoint mẫu (Giữ lại phục vụ kiểm tra hệ thống thô)
var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast");

app.Run();

// Record định nghĩa Object Weather phục vụ API mẫu bên trên
record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}