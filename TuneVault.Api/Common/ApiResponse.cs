namespace TuneVault.Api.Common
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T? Data { get; set; }
        public List<string>? Errors { get; set; }

        // Hàm nhanh để trả về kết quả Thành Công (Success = true)
        public static ApiResponse<T> SuccessResult(T data)
        {
            return new ApiResponse<T> { Success = true, Data = data, Errors = null };
        }

        // Hàm nhanh để trả về kết quả Thất Bại (Success = false)
        public static ApiResponse<T> FailureResult(List<string> errors)
        {
            return new ApiResponse<T> { Success = false, Data = default, Errors = errors };
        }

        public static ApiResponse<T> FailureResult(string error)
        {
            return new ApiResponse<T> { Success = false, Data = default, Errors = new List<string> { error } };
        }
    }
}