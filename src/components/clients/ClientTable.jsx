import PropTypes from "prop-types";
import Swal from "sweetalert2";

export const ClientTable = ({ clients, onEdit, onDeactivate, onActivate, showInactive }) => {

  const handleDeactivate = async (client) => {
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
    <div className="table-responsive">
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Dirección</th>
            {showInactive && <th>Motivo desactivación</th>}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className={!client.active ? "table-secondary" : ""}>
              <td>{client.id}</td>
              <td>{client.nombre}</td>
              <td>
                <i className="bi bi-telephone me-1"></i>
                {client.telefono}
              </td>
              <td>
                <i className="bi bi-envelope me-1"></i>
                {client.email}
              </td>
              <td>
                <i className="bi bi-geo-alt me-1"></i>
                {client.direccion}
              </td>
              {showInactive && <td>{client.desactivationReason || "—"}</td>}
              <td>
                <div className="d-flex gap-1 flex-wrap">
                  {client.active ? (
                    <>
                      <button className="btn btn-sm btn-outline-primary"
                        onClick={() => onEdit(client)}>
                        <i className="bi bi-pencil"></i>
                        <span className="d-none d-md-inline"> Editar</span>
                      </button>
                      <button className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeactivate(client)}>
                        <i className="bi bi-trash"></i>
                        <span className="d-none d-md-inline"> Desactivar</span>
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-sm btn-outline-success"
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
                      }}>
                      <i className="bi bi-arrow-counterclockwise"></i>
                      <span className="d-none d-md-inline"> Reactivar</span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {clients.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center text-muted py-4">
                No hay clientes registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

ClientTable.propTypes = {
  clients: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDeactivate: PropTypes.func.isRequired,
  onActivate: PropTypes.func.isRequired,
  showInactive: PropTypes.bool.isRequired
};
