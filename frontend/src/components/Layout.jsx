import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAuth } from "../hooks/useAuth";

export default function Layout() {
  const { isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" />;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <main className="flex-1 overflow-y-auto lg:ml-0">
        <Outlet />
      </main>
    </div>
  );
}
