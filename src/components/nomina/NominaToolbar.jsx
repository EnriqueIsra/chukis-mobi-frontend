import PropTypes from "prop-types";

const MONTHS = [
    { value: 1, label: "Enero" }, { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" }, { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" }, { value: 6, label: "Junio" },
    { value: 7, label: "Julio" }, { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" }, { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" }, { value: 12, label: "Diciembre" }
];

export const NominaToolbar = ({
    viewMode, onViewModeChange,
    showInactive, onToggleInactive,
    selectedYear, selectedMonth,
    onYearChange, onMonthChange,
    onOpenModal, currentUser
}) => {
    const currentYear = new Date().getFullYear();
    const years = [currentYear - 1, currentYear, currentYear + 1];

    return (
        <div className="d-flex flex-wrap align-items-center gap-2">
            {currentUser?.role === "ADMIN" && (
                <button className="btn btn-primary" onClick={onOpenModal}>
                    <i className="bi bi-plus-lg me-1"></i>
                    Registrar Pago
                </button>
            )}

            <div className="btn-group">
                <button
                    className={`btn btn-outline-secondary ${viewMode === "list" ? "active" : ""}`}
                    onClick={() => onViewModeChange("list")}
                >
                    <i className="bi bi-list-ul me-1"></i>Lista
                </button>
                <button
                    className={`btn btn-outline-secondary ${viewMode === "grouped" ? "active" : ""}`}
                    onClick={() => onViewModeChange("grouped")}
                >
                    <i className="bi bi-grid me-1"></i>Por trabajador
                </button>
            </div>

            {viewMode === "grouped" && (
                <>
                    <select
                        className="form-select w-auto"
                        value={selectedMonth}
                        onChange={(e) => onMonthChange(Number(e.target.value))}
                    >
                        {MONTHS.map((m) => (
                            <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                    </select>
                    <select
                        className="form-select w-auto"
                        value={selectedYear}
                        onChange={(e) => onYearChange(Number(e.target.value))}
                    >
                        {years.map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </>
            )}

            {currentUser?.role === "ADMIN" && (
                <div className="btn-group">
                    <button
                        className={`btn ${!showInactive ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => { if (showInactive) onToggleInactive(); }}
                    >
                        <i className="bi bi-eye me-1"></i>Activos
                    </button>
                    <button
                        className={`btn ${showInactive ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => { if (!showInactive) onToggleInactive(); }}
                    >
                        <i className="bi bi-eye-slash me-1"></i>Inactivos
                    </button>
                </div>
            )}
        </div>
    );
};

NominaToolbar.propTypes = {
    viewMode: PropTypes.string.isRequired,
    onViewModeChange: PropTypes.func.isRequired,
    showInactive: PropTypes.bool.isRequired,
    onToggleInactive: PropTypes.func.isRequired,
    selectedYear: PropTypes.number.isRequired,
    selectedMonth: PropTypes.number.isRequired,
    onYearChange: PropTypes.func.isRequired,
    onMonthChange: PropTypes.func.isRequired,
    onOpenModal: PropTypes.func.isRequired,
    currentUser: PropTypes.object
};
