import { useState } from "react";

const ProductSelectorRow = ({ product, selectedItem, onChange }) => {
  const quantity = selectedItem?.quantity || 0;
  const available = product.availableStock ?? 0;
  const total = product.totalStock ?? 0;
  const isOutOfStock = available <= 0;
  const [error, setError] = useState("");

  // Disponibilidad restante = disponible original - cantidad seleccionada
  const remaining = available - quantity;

  const handleChange = (e) => {
    // Solo permitir números
    const rawValue = e.target.value.replace(/[^0-9]/g, "");
    const numValue = rawValue === "" ? 0 : parseInt(rawValue, 10);

    if (numValue > available) {
      setError(`Solo hay ${available} unidades disponibles`);
      onChange(product, available);
    } else {
      setError("");
      onChange(product, numValue);
    }
  };

  const handleKeyDown = (e) => {
    // Prevenir letras y caracteres especiales excepto flechas, backspace, delete, tab
    const allowedKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
    if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }

    // Manejar flechas arriba/abajo manualmente para validar límites
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (quantity < available) {
        setError("");
        onChange(product, quantity + 1);
      } else {
        setError(`Solo hay ${available} unidades disponibles`);
      }
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setError("");
      if (quantity > 0) {
        onChange(product, quantity - 1);
      }
    }
  };

  return (
    <tr className={isOutOfStock ? "table-secondary" : ""}>
      <td>
        <div className="fw-semibold">{product.name}</div>
        {product.color && (
          <small className="text-muted">{product.color}</small>
        )}
      </td>
      <td>${product.price}</td>
      <td>
        {isOutOfStock ? (
          <span className="text-danger small">
            <i className="bi bi-exclamation-circle me-1"></i>
            Agotado en estas fechas
          </span>
        ) : (
          <span className={`badge ${remaining > 0 ? "bg-success" : "bg-warning text-dark"}`}>
            {remaining} / {total}
          </span>
        )}
      </td>
      <td>
        {isOutOfStock ? (
          <span className="text-muted small">—</span>
        ) : (
          <div>
            <input
              type="number"
              min="0"
              max={available}
              className={`form-control form-control-sm ${error ? "is-invalid" : ""}`}
              value={quantity || ""}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="0"
            />
            {error && (
              <div className="text-danger small mt-1">
                <i className="bi bi-exclamation-triangle me-1"></i>
                {error}
              </div>
            )}
          </div>
        )}
      </td>
    </tr>
  );
};

export default ProductSelectorRow;
