import PropTypes from "prop-types";
import Swal from "sweetalert2"

export const ExternalItemTable = ({ items, onEdit, onDeactivate, onActivate, showInactive }) => {

  const handleDeactivate = async (item) => {
    const result = await Swal.fire({
      title: "¿Desactivar ítem?",
      input: "textarea",
      inputLabel: "Motivo de desactivación",
      inputPlaceholder: "Escribe el motivo...",
      inputValidator: (value) => {
        if (!value) return "El motivo es obligatorio"
      },
      showCancelButton: true,
      confirmButtonText: "Desactivar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33"
    })
    if (result.isConfirmed) {
      onDeactivate(item.id, result.value)
    }
  }

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>Renta</th>
            <th>Proveedor</th>
            <th>Descripción</th>
            <th>Cantidad</th>
            <th>Costo unitario</th>
            <th>Total</th>
            <th>Notas</th>
            {showInactive && <th>Motivo desactivación</th>}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className={!item.active ? "table-secondary" : ""}>
              <td>{item.rentalId}</td>
              <td>{item.providerName}</td>
              <td>{item.description}</td>
              <td>{item.quantity}</td>
              <td>{item.unitCost.toLocaleString()}</td>
              <td>{item.totalCost.toLocaleString()}</td>
              <td>{item.notes || "-"}</td>
              {showInactive && <td>{item.desactivationReason || "-"}</td>}
              <td>
                <div className="d-flex gap-1 flex-wrap">
                {item.active ? (
                  <>
                    <button className="btn btn-sm btn-outline-primary"
                      onClick={() => onEdit(item)}
                    >
                      <i className="bi bi-pencil"></i>
                      <span className="d-none d-md-inline"> Editar</span>
                    </button>
                    <button className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDeactivate(item)}
                    >
                      <i className="bi bi-trash"></i>
                      <span className="d-none d-md-inline"> Desactivar</span>
                    </button>
                  </>
                ) : (
                  <button className="btn btn-sm btn-outline-success"
                    title="Reactivar"
                    onClick={async () => {
                      const r = await Swal.fire({
                        title: "¿Reactivar ítem?",
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonText: "Reactivar",
                        cancelButtonText: "Cancelar",
                        confirmButtonColor: "#198754"
                      });
                      if (r.isConfirmed) onActivate(item.id);
                    }}
                  >
                    <i className="bi bi-arrow-counterclockwise"></i>
                    <span className="d-none d-md-inline"> Reactivar</span>
                  </button>
                )}
                </div>
              </td>
            </tr>
          ))} 
          { items.length === 0 && (
            <tr>
              <td colSpan="9" className="text-center text-muted py-4">
                No hay ítems registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
ExternalItemTable.propTypes = {
  items: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDeactivate: PropTypes.func.isRequired,
  onActivate: PropTypes.func.isRequired,
  showInactive: PropTypes.bool.isRequired
};
