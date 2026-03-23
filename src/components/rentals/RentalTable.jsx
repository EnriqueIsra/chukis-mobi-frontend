import Swal from "sweetalert2";

const statusConfig = {
  CREATED: { label: 'Creada', class: 'bg-info' },
  DELIVERED: { label: 'Entregada', class: 'bg-warning' },
  PICKED_UP: { label: 'Recogida', class: 'bg-success' },
  CANCELLED: { label: 'Cancelada', class: 'bg-danger' }
};

const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return 'N/A';
  const date = new Date(dateTimeStr);
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const RentalTable = ({
  rentals,
  onView,
  onEdit,
  onDeactivate,
  onActivate,
  onChangeStatus,
  onCancel,
  onPayment,
  showInactive
}) => {

  const handleDeactivate = async (rental) => {
    const result = await Swal.fire({
      title: "¿Desactivar renta?",
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
      onDeactivate(rental.id, result.value);
    }
  };

  return (
    <table className="table table-bordered table-hover">
      <thead className="table-dark">
        <tr>
          <th>#</th>
          <th>Cliente</th>
          <th>Fechas</th>
          <th>Dirección</th>
          <th>Productos</th>
          <th>Total</th>
          <th>Estado</th>
          <th>Creado por</th>
          {showInactive && <th>Motivo desactivación</th>}
          <th width="160">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {rentals.length === 0 && (
          <tr>
            <td colSpan="10" className="text-center text-muted py-4">
              No hay rentas registradas
            </td>
          </tr>
        )}

        {rentals.map((rental) => {
          const status = statusConfig[rental.status] || statusConfig.CREATED;
          return (
            <tr key={rental.id} className={!rental.active ? "table-secondary" : ""}>
              <td>{rental.id}</td>
              <td>
                <strong>{rental.client?.name}</strong>
                <br />
                <small className="text-muted">{rental.client?.phone}</small>
              </td>
              <td>
                <div>
                  <i className="bi bi-calendar me-1 text-primary"></i>
                  {formatDateTime(rental.startDate)}
                </div>
                <div>
                  <i className="bi bi-calendar-check me-1 text-success"></i>
                  {formatDateTime(rental.endDate)}
                </div>
              </td>
              <td className="text-truncate" style={{ maxWidth: '200px' }}>
                {rental.address}
              </td>
              <td>
                <span className="badge bg-secondary">
                  {rental.items?.length || 0} items
                </span>
              </td>
              <td className="fw-bold text-success">${rental.total}</td>
              <td>
                <span className={`badge ${status.class}`}>
                  {status.label}
                </span>
              </td>
              <td>
                <small className="text-muted">
                  <i className="bi bi-person me-1"></i>
                  {rental.user?.username || 'N/A'}
                </small>
              </td>
              {showInactive && <td>{rental.desactivationReason || "—"}</td>}
              <td>
                <div className="d-flex gap-1 flex-wrap">
                  {rental.active ? (
                    <>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => onView(rental)}
                        title="Ver detalles"
                      >
                        <i className="bi bi-eye"></i>
                      </button>
                      {(rental.status === 'CREATED' || rental.status === 'DELIVERED') && (
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => onChangeStatus(rental)}
                          title="Cambiar estado"
                        >
                          <i className="bi bi-arrow-repeat"></i>
                        </button>
                      )}
                      {rental.status !== 'CANCELLED' && (
                        <button
                          className="btn btn-sm btn-outline-success"
                          onClick={() => onPayment(rental)}
                          title="Registrar pago"
                        >
                          <i className="bi bi-cash-coin"></i>
                        </button>
                      )}
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => onCancel(rental)}
                        title="Cancelar"
                      >
                        <i className="bi bi-x-circle"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => onEdit(rental)}
                        title="Editar"
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeactivate(rental)}
                        title="Desactivar"
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-sm btn-outline-success"
                      title="Reactivar"
                      onClick={async () => {
                        const r = await Swal.fire({
                          title: "¿Reactivar renta?",
                          text: `Se reactivará la renta #${rental.id}`,
                          icon: "question",
                          showCancelButton: true,
                          confirmButtonText: "Reactivar",
                          cancelButtonText: "Cancelar",
                          confirmButtonColor: "#198754"
                        });
                        if (r.isConfirmed) onActivate(rental.id);
                      }}>
                      <i className="bi bi-arrow-counterclockwise"></i>
                      <span className="d-none d-md-inline"> Reactivar</span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default RentalTable;
