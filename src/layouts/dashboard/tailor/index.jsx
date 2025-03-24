import { useState } from "react";
import Sidebar from "../customer/Sidebar";
import Navbar from "../customer/Navbar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Sidebar  */}
      <div className={`fixed inset-0 z-40 md:hidden ${isSidebarOpen ? "block" : "hidden"}`} onClick={() => setIsSidebarOpen(false)}></div>
      
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        className={`fixed left-0 top-0 h-full bg-white z-50 w-64 transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:relative md:translate-x-0 md:block`}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col w-full">
        <Navbar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="px-4 sm:px-6 py-6 bg-gray-100 h-full overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
