import { Outlet } from "react-router-dom";
import { Sidebar } from "../layout/Sidebar";
import { useState } from "react";

export const MainLayout = ({ user, onLogout }) => {
    const [collapsed, setCollapsed] = useState(false);
    return (
        <div className="d-flex">
            <Sidebar
                user={user}
                onLogout={onLogout}
                collapsed={collapsed}
                onToggle={() => setCollapsed(!collapsed)}
            />
            <main className="flex-grow-1 p-4">
                <Outlet />
            </main>
        </div>
    );
};
