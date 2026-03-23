import PropTypes from "prop-types";
import Swal from "sweetalert2";
import './clientCard.css';

export const ClientCard = ({ client, onEdit, onDeactivate, onActivate }) => {

  const handleDeactivate = async () => {
    const result = await Swal.fire({
      title: "¿Desactivar cliente?",
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
      onDeactivate(client.id, result.value);
    }
  };

  return (
    <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 mb-3">
      <div className="card client-card h-100 shadow-sm position-relative">

        {/* Hover actions */}
        <div className="card-actions" style={!client.active ? { opacity: 1, pointerEvents: "auto" } : {}}>
          {client.active ? (
            <>
              <button
                className="btn btn-sm btn-outline-warning"
                onClick={() => onEdit(client)}
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
                  title: "¿Reactivar cliente?",
                  text: `Se reactivará "${client.nombre}"`,
                  icon: "question",
                  showCancelButton: true,
                  confirmButtonText: "Reactivar",
                  cancelButtonText: "Cancelar",
                  confirmButtonColor: "#198754"
                });
                if (r.isConfirmed) onActivate(client.id);
              }}
            >
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          )}
        </div>

        {/* Contenido con opacidad si está desactivado */}
        <div style={!client.active ? { opacity: 0.5 } : {}}>
          {/* Header con inicial */}
          <div className="client-card-header">
            <div className="client-initial">
              {client.nombre?.charAt(0).toUpperCase()}
            </div>
            <h6 className="client-name">{client.nombre}</h6>
            <small className="text-muted">ID: #{client.id}</small>
          </div>

          {/* Body con información de contacto */}
          <div className="card-body">
            <div className="client-info-item">
              <i className="bi bi-telephone-fill text-primary"></i>
              <span>{client.telefono}</span>
            </div>

            <div className="client-info-item">
              <i className="bi bi-envelope-fill text-success"></i>
              <span className="text-truncate">{client.email}</span>
            </div>

            <div className="client-info-item">
              <i className="bi bi-geo-alt-fill text-danger"></i>
              <span>{client.direccion}</span>
            </div>
          </div>
        </div>

        {/* Footer con motivo si está desactivado */}
        {!client.active && client.desactivationReason && (
          <div className="card-footer bg-white">
            <small className="text-danger">
              <i className="bi bi-exclamation-circle me-1"></i>
              {client.desactivationReason}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

ClientCard.propTypes = {
  client: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDeactivate: PropTypes.func.isRequired,
  onActivate: PropTypes.func.isRequired
};
