import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authService } from "../../api";
import { useAuthStore } from "../../stores/authStore";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    displayName: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.displayName.trim() || !formData.email.trim() || !formData.password) {
      toast.error("Vui long dien day du thong tin");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Mat khau phai co it nhat 6 ky tu");
      return;
    }

    setLoading(true);
    try {
      console.log("Starting registration with:", { displayName: formData.displayName, email: formData.email });
      const response = await authService.register({
        displayName: formData.displayName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      console.log("Registration response:", response);

      if (response.success && response.data) {
        console.log("Setting auth with token:", response.data.token);
        setAuth(response.data.token, response.data.user);
        toast.success("Dang ky thanh cong!");
        navigate("/home");
      } else {
        console.warn("Registration response not successful:", response);
        toast.error("Đăng ký thất bại: phản hồi không hợp lệ");
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      const message = error.response?.data?.message || error.message || "Dang ky that bai";
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
          <p className="mt-2 text-gray-400">Tao tai khoan moi</p>
        </div>

        <div className="rounded-2xl bg-[#181818] p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Ten hien thi
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#282828] bg-[#282828] px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                placeholder="Nguyen Van A"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#282828] bg-[#282828] px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Mat khau
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-lg border border-[#282828] bg-[#282828] px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                placeholder="Toi thieu 6 ky tu"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-full bg-green-500 py-3.5 text-lg font-semibold text-black transition hover:bg-green-400 disabled:opacity-70"
            >
              {loading ? "Dang tao tai khoan..." : "Dang ky"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-400">
            Da co tai khoan?{" "}
            <Link to="/login" className="font-medium text-green-500 hover:underline">
              Dang nhap ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
