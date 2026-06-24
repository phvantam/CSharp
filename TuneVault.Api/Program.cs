using TuneVault.Api;
using TuneVault.Api.Middleware;
using TuneVault.Application;
using TuneVault.Infrastructure;
using TuneVault.Infrastructure.SignalR;

var builder = WebApplication.CreateBuilder(args);

// CORS
builder.Services.AddCors(options =>
    options.AddPolicy("TuneVaultFrontend", policy =>
        policy.WithOrigins("http://localhost:5173")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()
    )
);

// Layers Registration
builder.Services.AddApplication();

var uploadsRoot = Path.Combine(builder.Environment.ContentRootPath, "App_Data", "uploads");
Directory.CreateDirectory(uploadsRoot);
builder.Services.AddInfrastructure(builder.Configuration, uploadsRoot);

builder.Services.AddHttpContextAccessor();

// Controllers and JSON Serialization Options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

builder.Services.ConfigureHttpJsonOptions(options =>
{
    options.SerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    options.SerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

// Swagger Setup
builder.Services.AddTuneVaultSwagger();

var app = builder.Build();

app.UseCors("TuneVaultFrontend");
app.UseStaticFiles();
app.UseTuneVaultSwagger();

// Custom JWT Authentication Middleware
app.UseMiddleware<JwtAuthenticationMiddleware>();

// Map SignalR Hub
app.MapHub<NotificationHub>("/api/notificationHub");
app.MapHub<NotificationHub>("/notificationHub");

app.MapGet("/", () => Results.Ok(new { name = "TuneVault.Api", status = "ok" }));

// Serves files uploaded to App_Data/uploads
app.MapGet("/uploads/{**path}", (string path) =>
{
    var fullPath = Path.GetFullPath(Path.Combine(uploadsRoot, path.Replace('/', Path.DirectorySeparatorChar)));
    if (!fullPath.StartsWith(uploadsRoot, StringComparison.OrdinalIgnoreCase) || !System.IO.File.Exists(fullPath))
    {
        return Results.NotFound();
    }

    return Results.File(fullPath, contentType: null, enableRangeProcessing: true);
});

app.MapControllers();

app.Run();
