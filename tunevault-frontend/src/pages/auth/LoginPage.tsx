import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../../api";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({ email, password });

      if (response.success && response.data) {
        setAuth(response.data.token, response.data.user);
        toast.success(`Chào mừng trở lại, ${response.data.user.displayName}!`);
        navigate("/home");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Đăng nhập thất bại. Vui lòng thử lại.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#121212] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
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
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[#282828] bg-[#282828] px-4 py-3 text-white placeholder:text-gray-500 focus:border-green-500 focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Mật khẩu
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
