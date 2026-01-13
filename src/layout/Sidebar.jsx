import { NavLink } from "react-router-dom";
import { menuItems } from "./menuConfig";

export const Sidebar = ({ user, onLogout, collapsed, onToggle }) => {
  return (
    <div
      className={`bg-dark text-white vh-100 d-flex flex-column p-3 ${
        collapsed ? "sidebar-collapsed" : ""
      }`}
      style={{ width: collapsed ? "80px" : "230px", transition: "0.3s" }}
    >
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        {!collapsed && <h5 className="mb-0">ChukisApp</h5>}
        <button
          className="btn btn-sm btn-outline-light"
          onClick={onToggle}
        >
          <i className="bi bi-list"></i>
        </button>
      </div>

      {/* Menu */}
      <ul className="nav flex-column">
        {menuItems.map((item) => (
          <li className="nav-item mb-1" key={item.path}>
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `nav-link d-flex align-items-center gap-2 text-white ${
                  isActive ? "bg-primary rounded" : ""
                }`
              }
            >
              <i className={`bi ${item.icon}`}></i>
              {!collapsed && item.label}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* User info */}
      {user && (
        <div className="mt-auto mb-3 p-2 bg-secondary rounded text-center">
          {!collapsed && (
            <>
              <div className="fw-bold">{user.username}</div>
              <small>{user.role}</small>
            </>
          )}
        </div>
      )}

      {/* Logout */}
      <button
        className="btn btn-danger w-100"
        onClick={onLogout}
        title="Cerrar sesión"
      >
        <i className="bi bi-box-arrow-right"></i>
        {!collapsed && " Cerrar sesión"}
      </button>
    </div>
  );
};
