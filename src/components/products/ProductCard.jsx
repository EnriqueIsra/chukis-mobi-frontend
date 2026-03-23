import PropTypes from "prop-types";
import Swal from "sweetalert2";
import './productCard.css';

export const ProductCard = ({ product, onEdit, onDeactivate, onActivate }) => {

  const handleDeactivate = async () => {
    const result = await Swal.fire({
      title: "¿Desactivar producto?",
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
      onDeactivate(product.id, result.value);
    }
  };

  return (
    <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 mb-3">
      <div className="card product-card h-100 shadow-sm position-relative">

        {/* Hover actions — fuera de la opacidad */}
        <div className="card-actions" style={!product.active ? { opacity: 1, pointerEvents: "auto" } : {}}>
          {product.active ? (
            <>
              <button
                className="btn btn-sm btn-outline-warning"
                onClick={() => onEdit(product)}
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
                const result = await Swal.fire({
                  title: "¿Reactivar producto?",
                  text: `Se reactivará "${product.name}"`,
                  icon: "question",
                  showCancelButton: true,
                  confirmButtonText: "Reactivar",
                  cancelButtonText: "Cancelar",
                  confirmButtonColor: "#198754"
                });
                if (result.isConfirmed) onActivate(product.id);
              }}
            >
              <i className="bi bi-arrow-counterclockwise"></i>
            </button>
          )}
        </div>

        {/* Contenido con opacidad si está desactivado */}
        <div style={!product.active ? { opacity: 0.5 } : {}}>
        {/* Image */}
        <img
          src={product.imageUrl || "https://via.placeholder.com/300"}
          className="card-img-top"
          style={{ height: "180px", objectFit: "cover" }}
          alt={product.name}
        />

        {/* Body */}
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold mb-0">{product.name}</h6>
            <span className="badge bg-success">${product.price}</span>
          </div>

          <p className="text-muted small mb-2">
            {product.description}
          </p>

          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted">
              <i className="bi bi-palette me-1"></i>
              {product.color}
            </small>
            <small className="text-muted">
              <i className="bi bi-box me-1"></i>
              Stock: {product.stock}
            </small>
          </div>
        </div>

        </div>
        {/* Footer */}
        <div className="card-footer bg-white">
          <small className="text-muted">ID: {product.id}</small>
          {!product.active && product.desactivationReason && (
            <small className="text-danger d-block mt-1">
              <i className="bi bi-exclamation-circle me-1"></i>
              {product.desactivationReason}
            </small>
          )}
        </div>
      </div>
    </div>
  );
};

ProductCard.propTypes = {
  product: PropTypes.object.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDeactivate: PropTypes.func.isRequired,
  onActivate: PropTypes.func.isRequired
};
