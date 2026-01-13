import { Outlet } from "react-router-dom";
import { Sidebar } from "../layout/Sidebar";

export const MainLayout = ({ user, onLogout }) => {
  return (
    <div className="d-flex">
      <Sidebar user={user} onLogout={onLogout} />
      <main className="flex-grow-1 p-4">
        <Outlet />
      </main>
    </div>
  );
};
