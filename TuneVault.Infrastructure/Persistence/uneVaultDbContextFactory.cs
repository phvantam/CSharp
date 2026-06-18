using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace TuneVault.Infrastructure.Persistence;

public class TuneVaultDbContextFactory : IDesignTimeDbContextFactory<TuneVaultDbContext>
{
    public TuneVaultDbContext CreateDbContext(string[] args)
    {
        // 1. Tự động tìm đường dẫn tuyệt đối hướng về thư mục TuneVault.Api
        string currentDirectory = Directory.GetCurrentDirectory();
        string apiPath = currentDirectory;

        // Nếu đang đứng ở thư mục gốc solution, đi vào thư mục TuneVault.Api
        if (!currentDirectory.EndsWith("TuneVault.Api") && Directory.Exists(Path.Combine(currentDirectory, "TuneVault.Api")))
        {
            apiPath = Path.Combine(currentDirectory, "TuneVault.Api");
        }
        // Nếu đang đứng ở tầng Infrastructure, đi ngược ra rồi đi vào Api
        else if (currentDirectory.EndsWith("TuneVault.Infrastructure"))
        {
            apiPath = Path.Combine(currentDirectory, "../TuneVault.Api");
        }

        // 2. Đọc file appsettings.json
        var configuration = new ConfigurationBuilder()
            .SetBasePath(apiPath)
            .AddJsonFile("appsettings.json", optional: false)
            .Build();

        // 3. Lấy chuỗi kết nối
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        // PHƯƠNG ÁN DỰ PHÒNG CỨU CÁNH: 
        // Nếu EF CLI vẫn cứng đầu không đọc được file appsettings, hãy điền thẳng Connection String của bạn vào đây:
        if (string.IsNullOrEmpty(connectionString))
{
    // Đổi Server thành dấu chấm (.) để đồng bộ với máy của bạn
    connectionString = "Server=.;Database=TuneVaultDb;Trusted_Connection=True;TrustServerCertificate=True;MultipleActiveResultSets=true";
}

        var optionsBuilder = new DbContextOptionsBuilder<TuneVaultDbContext>();
        optionsBuilder.UseSqlServer(connectionString);

        return new TuneVaultDbContext(optionsBuilder.Options);
    }
}