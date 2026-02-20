const statusConfig = {
  CREATED: { label: 'Creada', class: 'bg-info' },
  DELIVERED: { label: 'Entregada', class: 'bg-warning' },
  PICKED_UP: { label: 'Recogida', class: 'bg-success' },
  CANCELLED: { label: 'Cancelada', class: 'bg-danger' }
};

// Formatear fecha y hora: "2024-01-15T10:00:00" -> "15/01/2024 10:00"
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

// Agregamos onPayment a las props
// Igual que en RentalCard, recibimos esta función
// del padre (RentalsPage) para manejar la acción de pagos
const RentalTable = ({ 
  rentals, 
  onView, 
  onEdit, 
  onDelete, 
  onChangeStatus, 
  onCancel,
  onPayment // prop para manejar pagos
 }) => {
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
          {/* Aumentamos en ancho de la columna de acciones de 130 a 160 para que quepa el botón de pagos sin que se vea apretado */}
          <th width="160">Acciones</th>
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
              <td>
                {/* Agregamos flex-wrap para que los botones puedan bajar a otra línea si no caben todos en una sola fila */}
                <div className="d-flex gap-1 flex-wrap">
                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => onView(rental)}
                    title="Ver detalles"
                  >
                    <i className="bi bi-eye"></i>
                  </button>
                  {rental.status === 'CREATED' || rental.status === 'DELIVERED' && (
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => onChangeStatus(rental)}
                      title="Cambiar estado"
                    >
                      <i className="bi bi-arrow-repeat"></i>
                    </button>
                  )}

                  {/* Botón de pagos en la tabla
                  Condición: rental.status !== 'CANCELLED'
                  - Solo aparece si la renta no está cancelada
                  onClick: LLamamos directamente a onPayment(rental)
                  - No necesitamos e.stopPropagation() aquí porque
                    la fila de la tabla no tiene onClick */}

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
