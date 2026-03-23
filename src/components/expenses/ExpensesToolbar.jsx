import PropTypes from "prop-types";

const CATEGORY_OPTIONS = [
    { value: "", label: "Todas las categorías" },
    { value: "GASOLINA", label: "Gasolina" },
    { value: "MANTENIMIENTO_VEHICULAR", label: "Mant. Vehicular" },
    { value: "LIMPIEZA_MANTENIMIENTO_MOBILIARIO", label: "Mant. Mobiliario" },
    { value: "INVERSION_INVENTARIO", label: "Inversión Inventario" },
    { value: "OTROS", label: "Otros" }
];

export const ExpensesToolbar = ({
    viewMode, onViewModeChange,
    showInactive, onToggleInactive,
    categoryFilter, onCategoryChange,
    onOpenModal, currentUser
}) => {
    return (
        <div className="d-flex flex-wrap align-items-center gap-2">

            {/* Botón registrar — solo ADMIN */}
            {currentUser?.role === "ADMIN" && (
                <button className="btn btn-primary" onClick={onOpenModal}>
                    <i className="bi bi-plus-lg me-1"></i>
                    Registrar Gasto
                </button>
            )}

            {/* Toggle vista cards / tabla */}
            <div className="btn-group">
                <button
                    className={`btn btn-outline-secondary ${viewMode === "cards" ? "active" : ""}`}
                    onClick={() => onViewModeChange("cards")}
                >
                    <i className="bi bi-grid me-1"></i>Cards
                </button>
                <button
                    className={`btn btn-outline-secondary ${viewMode === "table" ? "active" : ""}`}
                    onClick={() => onViewModeChange("table")}
                >
                    <i className="bi bi-list-ul me-1"></i>Tabla
                </button>
            </div>

            {/* Filtro por categoría */}
            <select
                className="form-select w-auto"
                value={categoryFilter}
                onChange={(e) => onCategoryChange(e.target.value)}
            >
                {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>

            {/* Toggle activos/inactivos — solo ADMIN */}
            {currentUser?.role === "ADMIN" && (
                <div className="btn-group">
                    <button
                        className={`btn btn-outline-secondary ${!showInactive ? "active" : ""}`}
                        onClick={() => { if (showInactive) onToggleInactive(); }}
                    >
                        <i className="bi bi-eye me-1"></i>Activos
                    </button>
                    <button
                        className={`btn btn-outline-secondary ${showInactive ? "active" : ""}`}
                        onClick={() => { if (!showInactive) onToggleInactive(); }}
                    >
                        <i className="bi bi-eye-slash me-1"></i>Inactivos
                    </button>
                </div>
            )}
        </div>
    );
};

ExpensesToolbar.propTypes = {
    viewMode: PropTypes.string.isRequired,
    onViewModeChange: PropTypes.func.isRequired,
    showInactive: PropTypes.bool.isRequired,
    onToggleInactive: PropTypes.func.isRequired,
    categoryFilter: PropTypes.string.isRequired,
    onCategoryChange: PropTypes.func.isRequired,
    onOpenModal: PropTypes.func.isRequired,
    currentUser: PropTypes.object
};
