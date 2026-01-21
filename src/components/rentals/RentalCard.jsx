import './rentalCard.css';

const statusConfig = {
  CREATED: { label: 'Creada', class: 'bg-info', icon: 'bi-clock' },
  DELIVERED: { label: 'Entregada', class: 'bg-warning', icon: 'bi-truck' },
  PICKED_UP: { label: 'Recogida', class: 'bg-success', icon: 'bi-check-circle' },
  CANCELLED: { label: 'Cancelada', class: 'bg-danger', icon: 'bi-x-circle' }
};

// Formatear fecha y hora de forma compacta: "15/01 10:00"
const formatDateTimeShort = (dateTimeStr) => {
  if (!dateTimeStr) return 'N/A';
  const date = new Date(dateTimeStr);
  return date.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const RentalCard = ({ rental, onView, onEdit, onDelete, onChangeStatus, onCancel }) => {
  const status = statusConfig[rental.status] || statusConfig.CREATED;

  const handleView = (e) => {
    e.stopPropagation();
    onView(rental);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(rental);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(rental.id);
  };

  return (
    <div className="col-12 col-sm-6 col-lg-4 col-xl-3 mb-3">
      <div className="card rental-card h-100 shadow-sm position-relative">

        {/* Hover actions */}
        <div className="card-actions">
          <button
            className="btn btn-sm btn-light"
            onClick={handleView}
            title="Ver detalles"
          >
            <i className="bi bi-eye"></i>
          </button>
          {rental.status === 'CREATED' && (
            <button
              className="btn btn-sm btn-secondary"
              onClick={(e) => {
                e.stopPropagation();
                onChangeStatus(rental);
              }}
              title="Cambiar estado"
            >
              <i className="bi bi-arrow-repeat"></i>
            </button>
          )}

          <button
            className="btn btn-sm btn-outline-danger"
            onClick={(e) => {
              e.stopPropagation();
              onCancel(rental);
            }}
            title="Cancelar renta"
          >
            <i className="bi bi-x-circle"></i>
          </button>
          <button
            className="btn btn-sm btn-warning"
            onClick={handleEdit}
            title="Editar"
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={handleDelete}
            title="Eliminar"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>

        {/* Status badge */}
        <div className={`rental-status-badge ${status.class}`}>
          <i className={`bi ${status.icon} me-1`}></i>
          {status.label}
        </div>

        {/* Header */}
        <div className="rental-card-header">
          <div className="rental-id">#{rental.id}</div>
          <div className="rental-dates">
            <i className="bi bi-calendar-range me-1"></i>
            {formatDateTimeShort(rental.startDate)} - {formatDateTimeShort(rental.endDate)}
          </div>
        </div>

        {/* Body */}
        <div className="card-body pt-2">
          {/* Cliente */}
          <div className="rental-info-item">
            <i className="bi bi-person-fill text-primary"></i>
            <span className="fw-semibold">{rental.client?.name || 'Sin cliente'}</span>
          </div>

          {/* Telefono */}
          <div className="rental-info-item">
            <i className="bi bi-telephone-fill text-primary"></i>
            <span className="text-truncate">{rental.client?.phone || 'Sin teléfono'}</span>
          </div>

          {/* Dirección */}
          <div className="rental-info-item">
            <i className="bi bi-geo-alt-fill text-danger"></i>
            <span className="text-truncate">{rental.address}</span>
          </div>

          {/* Items count */}
          <div className="rental-info-item">
            <i className="bi bi-box-seam text-warning"></i>
            <span>{rental.items?.length || 0} producto(s)</span>
          </div>

          {/* Creado por */}
          <div className="rental-info-item">
            <i className="bi bi-person-badge text-secondary"></i>
            <span className="text-muted small">{rental.user?.username || 'N/A'}</span>
          </div>

          {/* Total */}
          <div className="rental-total mt-2">
            <span className="total-label">Total:</span>
            <span className="total-amount">${rental.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalCard;