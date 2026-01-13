import { NavLink } from "react-router-dom";

export const Sidebar = ({ user, onLogout }) => {
  return (
    <div
      className="bg-dark text-white vh-100 d-flex flex-column p-3"
      style={{ width: "220px" }}
    >
      <div>
        <h5 className="mb-4">ChukisApp</h5>

        <ul className="nav flex-column">
          <li className="nav-item">
            <NavLink className="nav-link text-white" to="/">
              Dashboard
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink className="nav-link text-white" to="/products">
              Productos
            </NavLink>
          </li>

          <li className="nav-item">
            <NavLink className="nav-link text-white" to="/users">
              Usuarios
            </NavLink>
          </li>
        </ul>
      </div>

      {user && (
        <div className="mb-3 p-2 bg-secondary rounded mt-auto">
          <div className="fw-bold">{user.username}</div>
          <small>{user.role}</small>
        </div>
      )}

      <button className="btn btn-danger mt-2" onClick={onLogout}>
        Cerrar sesión
      </button>
    </div>
  );
};
