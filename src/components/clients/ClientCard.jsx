import './clientCard.css';

export const ClientCard = ({ client, onEdit, onRemove }) => {
  return (
    <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 mb-3">
      <div className="card client-card h-100 shadow-sm position-relative">

        {/* Hover actions */}
        <div className="card-actions">
          <button
            className="btn btn-sm btn-light"
            onClick={() => onEdit(client)}
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => onRemove(client.id)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>

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
    </div>
  );
};
