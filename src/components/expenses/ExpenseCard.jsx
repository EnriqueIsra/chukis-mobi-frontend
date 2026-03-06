import PropTypes from "prop-types"
import './expenseCard.css';

// Cada categoría tiene su propio icono y color para identificarla visualmente
const CATEGORY_CONFIG = {
    GASOLINA: { icon: "bi-fuel-pump", color: "#ff6b35", label: "Gasolina" },
    MANTENIMIENTO_VEHICULAR: { icon: "bi-wrench", color: "#ffc107", label: "Mantenimiento Vehicular" },
    LIMIEZA_MANTENIMIENTO_MOBILIARIO: { icon: "bi-spray", color: "#0dcaf0", label: "Mantenimiento/Limpieza Mobiliario" },
    INVERSION_INVENTARIO: { icon: "bi-cart-plus", color: "#198754", label: "Inversión Inventario" },
    OTROS: { icon: "bi-three-dots", color: "#6c757d", label: "Otros" }
}

// corregir aqui y el css también 
export const ProductCard = ({ product, onEdit, onRemove }) => {
  return (
    <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 mb-3">
      <div className="card product-card h-100 shadow-sm position-relative">

        {/* Hover actions */}
        <div className="card-actions">
          <button
            className="btn btn-sm btn-light"
            onClick={() => onEdit(product)}
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => onRemove(product.id)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>

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

        {/* Footer */}
        <div className="card-footer bg-white">
          <small className="text-muted">ID: {product.id}</small>
        </div>
      </div>
    </div>
  );
};
