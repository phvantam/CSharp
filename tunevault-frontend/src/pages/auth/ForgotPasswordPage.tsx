import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { authService } from "../../api";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [requested, setRequested] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestToken = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Vui long nhap email");
      return;
    }

    setLoading(true);
    try {
      const response = await authService.forgotPassword({ email: email.trim() });
      setRequested(true);
      setResetToken(response.data.resetToken);
      toast.success("Da tao ma dat lai mat khau");
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Khong the tao ma dat lai mat khau";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!resetToken.trim() || !newPassword || !confirmPassword) {
      toast.error("Vui long dien day du thong tin");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mat khau moi phai co it nhat 6 ky tu");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Mat khau xac nhan khong khop");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword({
        email: email.trim(),
        resetToken: resetToken.trim(),
        newPassword,
      });
      toast.success("Da dat lai mat khau. Hay dang nhap lai.");
      navigate("/login");
    } catch (error: any) {
      const message = error.response?.data?.message || "Dat lai mat khau that bai";
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
          <p className="mt-2 text-gray-400">Dat lai mat khau</p>
        </div>

        <div className="rounded-2xl bg-[#181818] p-8 shadow-xl">
          {!requested ? (
            <form onSubmit={handleRequestToken} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Email tai khoan
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-[#282828] bg-[#282828] px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-green-500 py-3.5 text-lg font-semibold text-black transition hover:bg-green-400 disabled:opacity-70"
              >
                {loading ? "Dang tao ma..." : "Lay ma dat lai"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5">
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-sm text-green-200">
                Ma reset demo da duoc tao. Khi co email service, ma nay se duoc gui
                qua email thay vi hien thi tren man hinh.
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Ma reset
                </label>
                <input
                  type="text"
                  value={resetToken}
                  onChange={(event) => setResetToken(event.target.value)}
                  className="w-full rounded-lg border border-[#282828] bg-[#282828] px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Mat khau moi
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full rounded-lg border border-[#282828] bg-[#282828] px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                  placeholder="Toi thieu 6 ky tu"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Nhap lai mat khau moi
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-lg border border-[#282828] bg-[#282828] px-4 py-3 text-white focus:border-green-500 focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-full bg-green-500 py-3.5 text-lg font-semibold text-black transition hover:bg-green-400 disabled:opacity-70"
              >
                {loading ? "Dang dat lai..." : "Dat lai mat khau"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-400">
            <Link to="/login" className="font-medium text-green-500 hover:underline">
              Quay lai dang nhap
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
