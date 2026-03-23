import PropTypes from "prop-types";
import Swal from "sweetalert2";

export const UserTable = ({ users, onEdit, onDeactivate, onActivate, showInactive }) => {

  const handleDeactivate = async (user) => {
    const result = await Swal.fire({
      title: "¿Desactivar usuario?",
      input: "textarea",
      inputLabel: "Motivo de desactivación",
      inputPlaceholder: "Escribe el motivo...",
      inputValidator: (value) => {
        if (!value) return "El motivo es obligatorio";
      },
      showCancelButton: true,
      confirmButtonText: "Desactivar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33"
    });
    if (result.isConfirmed) {
      onDeactivate(user.id, result.value);
    }
  };

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Usuario</th>
            <th>Rol</th>
            <th>Teléfono</th>
            {showInactive && <th>Motivo desactivación</th>}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className={!user.active ? "table-secondary" : ""}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                <i className="bi bi-telephone me-1"></i>
                {user.telefono}
              </td>
              {showInactive && <td>{user.desactivationReason || "—"}</td>}
              <td>
                <div className="d-flex gap-1 flex-wrap">
                  {user.active ? (
                    <>
                      <button className="btn btn-sm btn-outline-primary"
                        onClick={() => onEdit(user)}>
                        <i className="bi bi-pencil"></i>
                        <span className="d-none d-md-inline"> Editar</span>
                      </button>
                      <button className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeactivate(user)}>
                        <i className="bi bi-trash"></i>
                        <span className="d-none d-md-inline"> Desactivar</span>
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-sm btn-outline-success"
                      title="Reactivar"
                      onClick={async () => {
                        const r = await Swal.fire({
                          title: "¿Reactivar usuario?",
                          text: `Se reactivará "${user.username}"`,
                          icon: "question",
                          showCancelButton: true,
                          confirmButtonText: "Reactivar",
                          cancelButtonText: "Cancelar",
                          confirmButtonColor: "#198754"
                        });
                        if (r.isConfirmed) onActivate(user.id);
                      }}>
                      <i className="bi bi-arrow-counterclockwise"></i>
                      <span className="d-none d-md-inline"> Reactivar</span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center text-muted py-4">
                No hay usuarios registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

UserTable.propTypes = {
  users: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDeactivate: PropTypes.func.isRequired,
  onActivate: PropTypes.func.isRequired,
  showInactive: PropTypes.bool.isRequired
};
