import Swal from "sweetalert2";
import './rentalCard.css';

const statusConfig = {
  CREATED: { label: 'Creada', class: 'bg-info', icon: 'bi-clock' },
  DELIVERED: { label: 'Entregada', class: 'bg-warning', icon: 'bi-truck' },
  PICKED_UP: { label: 'Recogida', class: 'bg-success', icon: 'bi-check-circle' },
  CANCELLED: { label: 'Cancelada', class: 'bg-danger', icon: 'bi-x-circle' }
};

const formatDateTimeLong = (dateTimeStr) => {
  if (!dateTimeStr) return 'N/A';
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString('es-MX', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const RentalCard = ({
  rental,
  onView,
  onEdit,
  onDeactivate,
  onActivate,
  onChangeStatus,
  onCancel,
  onPayment,
  onContract
}) => {
  const status = statusConfig[rental.status] || statusConfig.CREATED;

  const handleDeactivate = async (e) => {
    e.stopPropagation();
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
    <div className="col-12 col-sm-6 col-lg-4 col-xl-3 mb-3">
      <div className="card rental-card h-100 shadow-sm position-relative">

        {/* Hover actions */}
        <div className="card-actions" style={!rental.active ? { opacity: 1, pointerEvents: "auto" } : {}}>
          {rental.active ? (
            <>
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={(e) => { e.stopPropagation(); onView(rental); }}
                title="Ver detalles"
              >
                <i className="bi bi-eye"></i>
              </button>
              {(rental.status === 'CREATED' || rental.status === 'DELIVERED') && (
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={(e) => { e.stopPropagation(); onChangeStatus(rental); }}
                  title="Cambiar estado"
                >
                  <i className="bi bi-arrow-repeat"></i>
                </button>
              )}
              {rental.status !== 'CANCELLED' && (
                <button
                  className="btn btn-sm btn-outline-success"
                  onClick={(e) => { e.stopPropagation(); onPayment(rental); }}
                  title="Registrar pago"
                >
                  <i className="bi bi-cash-coin"></i>
                </button>
              )}
              {rental.status !== 'CANCELLED' && (
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={(e) => { e.stopPropagation(); onContract(rental); }}
                  title="Generar contrato"
                >
                  <i className="bi bi-file-earmark-text"></i>
                </button>
              )}
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={(e) => { e.stopPropagation(); onCancel(rental); }}
                title="Cancelar renta"
              >
                <i className="bi bi-x-circle"></i>
              </button>
              <button
                className="btn btn-sm btn-outline-warning"
                onClick={(e) => { e.stopPropagation(); onEdit(rental); }}
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
              onClick={async (e) => {
                e.stopPropagation();
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
              }}
            >
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          )}
        </div>

        {/* Contenido con opacidad si está desactivada */}
        <div style={!rental.active ? { opacity: 0.5 } : {}}>
          {/* Status badge */}
          <div className={`rental-status-badge ${status.class}`}>
            <i className={`bi ${status.icon} me-1`}></i>
            {status.label}
          </div>

          {/* Header */}
          <div className="rental-card-header">
            <div className="rental-id">#{rental.id}</div>
            <div className="rental-dates text-capitalize">
              <div>
                <i className="bi bi-calendar-event me-1"></i>
                <strong>Inicio:</strong> {formatDateTimeLong(rental.startDate)}
              </div>
              <div>
                <i className="bi bi-calendar-check me-1"></i>
                <strong>Fin:</strong> {formatDateTimeLong(rental.endDate)}
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="card-body pt-2">
            <div className="rental-info-item">
              <i className="bi bi-person-fill text-primary"></i>
              <span className="fw-semibold">{rental.client?.name || 'Sin cliente'}</span>
            </div>
            <div className="rental-info-item">
              <i className="bi bi-telephone-fill text-primary"></i>
              <span className="text-truncate">{rental.client?.phone || 'Sin teléfono'}</span>
            </div>
            <div className="rental-info-item">
              <i className="bi bi-geo-alt-fill text-danger"></i>
              <span className="text-truncate">{rental.address}</span>
            </div>
            <div className="rental-info-item">
              <i className="bi bi-box-seam text-warning"></i>
              <span>{rental.items?.length || 0} producto(s)</span>
            </div>
            <div className="rental-info-item">
              <i className="bi bi-person-badge text-secondary"></i>
              <span className="text-muted small">{rental.user?.username || 'N/A'}</span>
            </div>
            <div className="rental-total mt-2">
              <span className="total-label">Total:</span>
              <span className="total-amount">${rental.total}</span>
            </div>
          </div>
        </div>

        {/* Footer con motivo si está desactivada */}
        {!rental.active && rental.desactivationReason && (
          <div className="card-footer bg-white">
            <small className="text-danger">
              <i className="bi bi-exclamation-circle me-1"></i>
              {rental.desactivationReason}
            </small>
          </div>
        )}
      </div>
    </div>
  );
};

export default RentalCard;
