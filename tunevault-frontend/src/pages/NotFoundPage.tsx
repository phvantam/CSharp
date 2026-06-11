import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-bold text-red-500">404</h1>
      <p className="mt-4 text-2xl">Trang không tồn tại</p>
      <Link
        to="/home"
        className="mt-6 rounded bg-green-500 px-6 py-3 text-white hover:bg-green-600"
      >
        Quay về trang chủ
      </Link>
    </div>
  );
};

export default NotFoundPage;
