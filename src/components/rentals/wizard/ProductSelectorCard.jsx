import { useState } from "react";

const ProductSelectorCard = ({ product, selectedItem, onChange }) => {
    const quantity = selectedItem?.quantity || 0;  // propias
    const subcontractedQuantity = selectedItem?.subcontractedQuantity || 0;  // externas
    const available = product.availableStock ?? 0;
    const total = product.totalStock ?? 0;
    const isOutOfStock = available <= 0;
    const [error, setError] = useState("");
    const [showSubcontract, setShowSubcontract] = useState(subcontractedQuantity > 0);
    const [editingSubcontract, setEditingSubcontract] = useState(false);
    const [tempSubQty, setTempSubQty] = useState(subcontractedQuantity);

    // Disponibilidad restante = disponible - propias seleccionadas
    const remaining = available - quantity;

    // El botón de subcontratar solo aparece si usó TODO el stock
    const canSubcontract = quantity > 0 && quantity >= available;

    const handleChange = (e) => {
        const rawValue = e.target.value.replace(/[^0-9]/g, "");
        const numValue = rawValue === "" ? 0 : parseInt(rawValue, 10);

        // Max siempre es el stock disponible real
        if (numValue > available) {
            setError(`Solo hay ${available} unidades disponibles`);
            onChange(product, available, subcontractedQuantity);
        } else {
            setError("");
            onChange(product, numValue, subcontractedQuantity);
        }
    };

    const handleKeyDown = (e) => {
        const allowedKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"];
        if (!/[0-9]/.test(e.key) && !allowedKeys.includes(e.key)) {
            e.preventDefault();
        }
        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (quantity < available) {
                setError("");
                onChange(product, quantity + 1, subcontractedQuantity);
            } else {
                setError(`Solo hay ${available} unidades disponibles`);
            }
        }
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setError("");
            if (quantity > 0) {
                onChange(product, quantity - 1, subcontractedQuantity);
            }
        }
    };

    const handleOpenSubcontract = () => {
        setShowSubcontract(true);
        setEditingSubcontract(true);
        setTempSubQty(subcontractedQuantity || "");
    };

    const handleAcceptSubcontract = () => {
        const val = parseInt(tempSubQty, 10) || 0;
        if (val <= 0) {
            // Si pone 0, quitar subcontrato
            setShowSubcontract(false);
            setEditingSubcontract(false);
            onChange(product, quantity, 0);
            return;
        }
        setEditingSubcontract(false);
        onChange(product, quantity, val);
    };

    const handleRemoveSubcontract = () => {
        setShowSubcontract(false);
        setEditingSubcontract(false);
        setTempSubQty(0);
        onChange(product, quantity, 0);
    };

    return (
        <div className="col-12 col-sm-6 col-lg-4 mb-3">
            <div className={`card h-100 ${isOutOfStock ? "opacity-50" : ""}`}>
                <img
                    src={product.imageUrl || "https://via.placeholder.com/300"}
                    className="card-img-top"
                    style={{ height: "150px", objectFit: "cover" }}
                    alt={product.name}
                />
                <div className="card-body">
                    <h6 className="fw-bold mb-1">{product.name}</h6>
                    {product.color && (
                        <small className="text-muted">
                            <i className="bi bi-palette me-1"></i>{product.color}
                        </small>
                    )}

                    <div className="my-2">
                        <div className="d-flex justify-content-between align-items-center">
                            <span className="badge bg-success">${product.price}</span>
                            {isOutOfStock && (
                                <span className="text-danger small">
                                    <i className="bi bi-exclamation-circle me-1"></i>Agotado
                                </span>
                            )}
                        </div>
                        {!isOutOfStock && (
                            <div className="small text-muted mt-1">
                                <div>Total: <strong>{total}</strong></div>
                                <div>
                                    Disponibles: <strong className={remaining > 0 ? "text-success" : remaining === 0 ? "text-warning" : "text-danger"}>
                                        {remaining}
                                    </strong>
                                </div>
                            </div>
                        )}
                    </div>

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
                                placeholder="Cantidad (propias)"
                            />
                            {error && (
                                <div className="text-danger small mt-1">
                                    <i className="bi bi-exclamation-triangle me-1"></i>{error}
                                </div>
                            )}
                        </>
                    )}

                    {/* Botón subcontratar: solo si usó todo el stock */}
                    {canSubcontract && !showSubcontract && (
                        <button
                            className="btn btn-sm btn-outline-secondary w-100 mt-2"
                            onClick={handleOpenSubcontract}
                        >
                            <i className="bi bi-truck me-1"></i>Subcontratar
                        </button>
                    )}

                    {/* Sección de subcontrato */}
                    {showSubcontract && (
                        <div className="mt-2 p-2 border rounded bg-light">
                            {editingSubcontract ? (
                                <>
                                    <label className="form-label small mb-1 fw-semibold">
                                        <i className="bi bi-truck me-1"></i>Cantidad a subcontratar
                                    </label>
                                    <div className="d-flex gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            className="form-control form-control-sm"
                                            value={tempSubQty}
                                            onChange={e => setTempSubQty(e.target.value)}
                                            placeholder="0"
                                            autoFocus
                                        />
                                        <button className="btn btn-sm btn-success" onClick={handleAcceptSubcontract}>
                                            <i className="bi bi-check-lg"></i>
                                        </button>
                                        <button className="btn btn-sm btn-outline-secondary" onClick={handleRemoveSubcontract}>
                                            <i className="bi bi-x-lg"></i>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="d-flex justify-content-between align-items-center">
                                        <span className="small">
                                            <i className="bi bi-truck me-1"></i>
                                            <strong>{subcontractedQuantity}</strong> externas
                                        </span>
                                        <div className="d-flex gap-1">
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() => { setEditingSubcontract(true); setTempSubQty(subcontractedQuantity); }}
                                                title="Editar"
                                            >
                                                <i className="bi bi-pencil"></i>
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={handleRemoveSubcontract}
                                                title="Quitar subcontrato"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <small className="text-muted">
                                        {quantity} propias + {subcontractedQuantity} externas = {quantity + subcontractedQuantity} total
                                    </small>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProductSelectorCard;
