import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { findAll } from "../../services/rentalService";
import "./rentalSearchDropdown.css";

const statusConfig = {
    CREATED: { label: "Creada", class: "bg-info", icon: "bi-clock" },
    DELIVERED: { label: "Entregada", class: "bg-warning", icon: "bi-truck" },
    PICKED_UP: { label: "Recogida", class: "bg-success", icon: "bi-check-circle" },
    CANCELLED: { label: "Cancelada", class: "bg-danger", icon: "bi-x-circle" }
};

const formatDateShort = (dateTimeStr) => {
    if (!dateTimeStr) return "N/A";
    const date = new Date(dateTimeStr);
    return date.toLocaleString("es-MX", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit"
    });
};

export const RentalSearchDropdown = ({ selectedRental, onSelect, onClear }) => {
    const [rentals, setRentals] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef(null);
    const blurTimeout = useRef(null);

    useEffect(() => {
        setLoading(true);
        findAll()
            .then((res) => {
                if (res?.data) setRentals(res.data);
            })
            .finally(() => setLoading(false));
    }, []);

    const filteredRentals = rentals.filter((rental) => {
        if (!searchTerm) return true;
        const s = searchTerm.toLowerCase();
        return (
            rental.id?.toString().includes(s) ||
            rental.address?.toLowerCase().includes(s) ||
            rental.status?.toLowerCase().includes(s) ||
            rental.total?.toString().includes(s) ||
            rental.client?.name?.toLowerCase().includes(s) ||
            rental.client?.phone?.includes(s) ||
            rental.user?.username?.toLowerCase().includes(s)
        );
    });

    const handleFocus = () => {
        if (!selectedRental) setIsOpen(true);
    };

    const handleBlur = () => {
        blurTimeout.current = setTimeout(() => setIsOpen(false), 200);
    };

    const handleSelect = (rental) => {
        clearTimeout(blurTimeout.current);
        setIsOpen(false);
        setSearchTerm("");
        onSelect(rental);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Escape") setIsOpen(false);
    };

    // Si hay rental seleccionada, mostrar card compacta
    if (selectedRental) {
        const status = statusConfig[selectedRental.status] || statusConfig.CREATED;
        return (
            <div className="rental-selected-card">
                <div className="rental-selected-info">
                    <strong>#{selectedRental.id}</strong>
                    <span>
                        <i className="bi bi-person me-1"></i>
                        {selectedRental.client?.name || "Sin cliente"}
                    </span>
                    <span>
                        <i className="bi bi-geo-alt me-1"></i>
                        {selectedRental.address || "Sin dirección"}
                    </span>
                    <span className={`badge ${status.class}`}>
                        <i className={`bi ${status.icon} me-1`}></i>
                        {status.label}
                    </span>
                    <span>
                        <strong>${selectedRental.total}</strong>
                    </span>
                </div>
                <button className="btn-clear" onClick={onClear} title="Limpiar selección">
                    <i className="bi bi-x-lg"></i>
                </button>
            </div>
        );
    }

    return (
        <div className="rental-search-dropdown" ref={containerRef}>
            <input
                type="text"
                className="form-control"
                placeholder={loading ? "Cargando rentas..." : "Buscar renta por cliente, dirección, teléfono, ID..."}
                value={searchTerm}
                onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setIsOpen(true);
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                disabled={loading}
            />

            {isOpen && (
                <div className="dropdown-list">
                    {filteredRentals.length === 0 ? (
                        <div className="text-center text-muted py-3">
                            <i className="bi bi-search me-1"></i>
                            Sin resultados
                        </div>
                    ) : (
                        filteredRentals.map((rental) => {
                            const st = statusConfig[rental.status] || statusConfig.CREATED;
                            return (
                                <div
                                    key={rental.id}
                                    className="dropdown-item-rental"
                                    onMouseDown={() => handleSelect(rental)}
                                >
                                    <div className="d-flex justify-content-between align-items-center mb-1">
                                        <strong>#{rental.id}</strong>
                                        <span className={`badge ${st.class}`}>
                                            <i className={`bi ${st.icon} me-1`}></i>
                                            {st.label}
                                        </span>
                                    </div>
                                    <div className="small">
                                        <i className="bi bi-person me-1 text-primary"></i>
                                        {rental.client?.name || "Sin cliente"}
                                        {rental.client?.phone && (
                                            <span className="text-muted ms-2">
                                                <i className="bi bi-telephone me-1"></i>
                                                {rental.client.phone}
                                            </span>
                                        )}
                                    </div>
                                    <div className="small text-muted">
                                        <i className="bi bi-geo-alt me-1"></i>
                                        {rental.address || "Sin dirección"}
                                    </div>
                                    <div className="d-flex justify-content-between align-items-center small mt-1">
                                        <span className="text-muted">
                                            <i className="bi bi-calendar-range me-1"></i>
                                            {formatDateShort(rental.startDate)} - {formatDateShort(rental.endDate)}
                                        </span>
                                        <strong className="text-success">${rental.total}</strong>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            )}
        </div>
    );
};

RentalSearchDropdown.propTypes = {
    selectedRental: PropTypes.object,
    onSelect: PropTypes.func.isRequired,
    onClear: PropTypes.func.isRequired
};
