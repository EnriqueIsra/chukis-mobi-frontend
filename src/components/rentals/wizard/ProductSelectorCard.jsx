import { useState } from "react";
const ProductSelectorCard = ({ product, selectedItem, onChange }) => {
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
        <div className="col-12 col-sm-6 col-lg-4 mb-3">
            <div className={`card h-100 ${isOutOfStock ? "opacity-50" : ""}`}>

                {/* Imagen */}
                <img
                    src={product.imageUrl || "https://via.placeholder.com/300"}
                    className="card-img-top"
                    style={{ height: "150px", objectFit: "cover" }}
                    alt={product.name}
                />

                <div className="card-body">
                    {/* Nombre + Color */}
                    <h6 className="fw-bold mb-1">{product.name}</h6>
                    {product.color && (
                        <small className="text-muted">
                            <i className="bi bi-palette me-1"></i>
                            {product.color}
                        </small>
                    )}

                    {/* Precio + Disponibilidad */}
                    <div className="d-flex justify-content-between align-items-center my-2">
                        <span className="badge bg-success">{product.price}</span>
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
                    </div>

                    {/* Input de cantidad (misma lógica que el Row) */}
                    {isOutOfStock ? (
                        <span className="text-danger small">Agotado en estas fechas</span>
                    ) : (
                        <>

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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductSelectorCard;
