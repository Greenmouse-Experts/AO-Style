import { useState, useEffect } from "react";
import Sidebar from "../logistics/Sidebar";
import Navbar from "../logistics/Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import useGetUserProfile from "../../../modules/Auth/hooks/useGetProfile";
import Loader from "../../../components/ui/Loader";
import useToast from "../../../hooks/useToast";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const navigate = useNavigate();

  const { toastError } = useToast();

  const { setCaryBinUser, logOut } = useCarybinUserStore();

  const { data, isPending, isSuccess, isError, error } = useGetUserProfile();

  useEffect(() => {
    if (data && isSuccess) {
      setCaryBinUser(data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  useEffect(() => {
    if (isError && error?.data?.message === "Unauthorized") {
      toastError("Unauthorized");
      logOut();
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error, isError]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (isPending) {
    return (
      <div className="m-auto flex h-screen items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed left-0 top-0 h-full bg-white z-50 w-64 transition-transform duration-300 transform
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
          md:relative md:translate-x-0 md:block`}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 bg-gray-100 h-full overflow-y-auto px-4 sm:px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
