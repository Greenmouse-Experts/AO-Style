import { useState, useEffect } from "react";
import Sidebar from "../logistics/Sidebar";
import Navbar from "../logistics/Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import { useCarybinUserStore } from "../../../store/carybinUserStore";
import useGetUserProfile from "../../../modules/Auth/hooks/useGetProfile";
import Loader from "../../../components/ui/Loader";
import useToast from "../../../hooks/useToast";
import useCrossTabLogout from "../../../hooks/useGlobalLayout";
import useSessionManager from "../../../hooks/useSessionManager";
import SessionExpiryModal from "../../../components/SessionExpiryModal";
import useProfilePolling from "../../../hooks/useProfilePolling";

export default function DashboardLayout() {
  useCrossTabLogout();
  useProfilePolling(); // Poll user profile every 1 minute and logout on 401

  // Session management
  const {
    isSessionModalOpen,
    timeRemaining,
    isRefreshing,
    handleExtendSession,
    handleLogout,
  } = useSessionManager();

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);
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

  // if (isPending) {
  //   return (
  //     <div className="m-auto flex h-screen items-center justify-center">
  //       <Loader />
  //     </div>
  //   );
  // }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Overlay for Mobile & Tablet */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed left-0 top-0 h-full bg-white z-50 w-64 transition-transform duration-300 transform
      ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
      lg:translate-x-0 lg:relative lg:block`}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full overflow-hidden">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 bg-gray-100 h-full overflow-y-auto px-4 sm:px-6 py-6">
          <Outlet />
        </main>
      </div>

      {/* Session Expiry Modal */}
      <SessionExpiryModal
        isOpen={isSessionModalOpen}
        onExtendSession={handleExtendSession}
        onLogout={handleLogout}
        timeRemaining={timeRemaining}
        isRefreshing={isRefreshing}
      />
    </div>
  );
}
