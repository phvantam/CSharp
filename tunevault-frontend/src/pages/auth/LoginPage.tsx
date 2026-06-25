import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../api";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [formData, setFormData] = useState({
    loginIdentifier: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const loginIdentifier = formData.loginIdentifier.trim().replace(/\s+/g, "");
    const password = formData.password;

    if (!loginIdentifier || !password) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);

    try {
      const response: any = await authService.login({
        loginIdentifier,
        password,
      });

      // Hỗ trợ cả 2 kiểu response:
      // 1. Backend trả thẳng AuthResponseDto: { token, username, email, displayName }
      // 2. API wrapper trả: { success, data: { token, user } }
      const authData = response?.data ?? response;
      const token = authData?.token;
      const user = authData?.user ?? {
        id: authData?.userId ?? authData?.id ?? "",
        username: authData?.username ?? "",
        email: authData?.email ?? loginIdentifier,
        displayName:
          authData?.displayName ?? authData?.username ?? "Người dùng",
        avatarUrl: authData?.avatarUrl ?? "",
      };

      if (!token) {
        throw new Error("Không nhận được token từ server");
      }

      setAuth(token, user);
      toast.success(`Chào mừng trở lại, ${user.displayName}!`);
      navigate("/home");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] px-4">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-bold tracking-tighter text-green-500">
            TuneVault
          </h1>
          <p className="mt-2 text-gray-400">Đăng nhập để tiếp tục</p>
        </div>

        <div className="rounded-2xl bg-[#181818] p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Email hoặc Tên đăng nhập
              </label>
              <input
                type="text"
                name="loginIdentifier"
                value={formData.loginIdentifier}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#282828] bg-[#282828] px-4 py-3 text-white placeholder:text-gray-500 focus:border-green-500 focus:outline-none"
                placeholder="Email hoặc Tên đăng nhập"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Mật khẩu
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#282828] bg-[#282828] px-4 py-3 text-white placeholder:text-gray-500 focus:border-green-500 focus:outline-none"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-full bg-green-500 py-3.5 text-lg font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Chưa có tài khoản?{" "}
            <Link
              to="/register"
              className="font-medium text-green-500 hover:underline"
            >
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
