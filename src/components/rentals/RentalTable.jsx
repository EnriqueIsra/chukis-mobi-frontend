const statusConfig = {
  CREATED: { label: 'Creada', class: 'bg-info' },
  DELIVERED: { label: 'Entregada', class: 'bg-warning' },
  PICKED_UP: { label: 'Recogida', class: 'bg-success' },
  CANCELLED: { label: 'Cancelada', class: 'bg-danger' }
};

const RentalTable = ({ rentals, onView, onEdit, onDelete }) => {
  return (
    <table className="table table-bordered table-hover">
      <thead className="table-light">
        <tr>
          <th>#</th>
          <th>Cliente</th>
          <th>Fechas</th>
          <th>Dirección</th>
          <th>Productos</th>
          <th>Total</th>
          <th>Estado</th>
          <th>Creado por</th>
          <th width="130">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {rentals.length === 0 && (
          <tr>
            <td colSpan="9" className="text-center text-muted py-4">
              No hay rentas registradas
            </td>
          </tr>
        )}

        {rentals.map((rental) => {
          const status = statusConfig[rental.status] || statusConfig.CREATED;
          return (
            <tr key={rental.id}>
              <td>{rental.id}</td>
              <td>
                <strong>{rental.client?.name}</strong>
                <br />
                <small className="text-muted">{rental.client?.phone}</small>
              </td>
              <td>
                <i className="bi bi-calendar me-1 text-primary"></i>
                {rental.startDate}
                <br />
                <i className="bi bi-calendar-check me-1 text-success"></i>
                {rental.endDate}
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
              <td>
                <div className="d-flex gap-1">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => onView(rental)}
                    title="Ver detalles"
                  >
                    <i className="bi bi-eye"></i>
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
                    onClick={() => onDelete(rental.id)}
                    title="Eliminar"
                  >
                    <i className="bi bi-trash"></i>
                  </button>
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
