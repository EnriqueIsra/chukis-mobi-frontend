import PropTypes from "prop-types";
import Swal from "sweetalert2";
import './userCard.css';

export const UserCard = ({ user, onEdit, onDeactivate, onActivate }) => {

  const handleDeactivate = async () => {
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
    <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 mb-3">
      <div className="card user-card h-100 shadow-sm position-relative">

        {/* Hover actions */}
        <div className="card-actions" style={!user.active ? { opacity: 1, pointerEvents: "auto" } : {}}>
          {user.active ? (
            <>
              <button
                className="btn btn-sm btn-outline-warning"
                onClick={() => onEdit(user)}
                title="Editar"
              >
                <i className="bi bi-pencil"></i>
              </button>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={handleDeactivate}
                title="Desactivar"
              >
                <i className="bi bi-trash"></i>
              </button>
            </>
          ) : (
            <button
              className="btn btn-sm btn-outline-success"
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
              }}
            >
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          )}
        </div>

        {/* Contenido con opacidad si está desactivado */}
        <div style={!user.active ? { opacity: 0.5 } : {}}>
          {/* Image */}
          <img
            src={user.imageUrl || "https://via.placeholder.com/300"}
            className="card-img-top"
            style={{ height: "180px", objectFit: "cover" }}
            alt={user.username}
          />

          {/* Body */}
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center">
              <h6 className="fw-bold mb-0">{user.username}</h6>
              <span className="badge bg-primary">{user.role}</span>
            </div>

            <p className="text-muted small mt-2">
              Usuario del sistema ChukisApp
            </p>
            <div className="user-info-item">
              <i className="bi bi-telephone-fill text-primary"></i>
              <span>{user.telefono}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="card-footer bg-white">
          <small className="text-muted">ID: {user.id}</small>
          {!user.active && user.desactivationReason && (
            <small className="text-danger d-block mt-1">
              <i className="bi bi-exclamation-circle me-1"></i>
              {user.desactivationReason}
            </small>
          )}
        </div>
      </div>
    </div>
  );
};

UserCard.propTypes = {
  user: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDeactivate: PropTypes.func.isRequired,
  onActivate: PropTypes.func.isRequired
};
