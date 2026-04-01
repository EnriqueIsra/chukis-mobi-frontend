import { useState, useEffect } from "react";
import * as itemService from "../services/rentalExternalItemService";
import * as providerService from "../services/providerService";
import { SubcontractModal } from "../components/externalItems/SubcontractModal";
import { ModuleHeader } from "../components/common/ModuleHeader";

const statusConfig = {
    CREATED: { label: "Creada", class: "bg-info", icon: "bi-clock" },
    DELIVERED: { label: "Entregada", class: "bg-warning", icon: "bi-truck" },
    PICKED_UP: { label: "Recogida", class: "bg-success", icon: "bi-check-circle" },
    CANCELLED: { label: "Cancelada", class: "bg-danger", icon: "bi-x-circle" }
};

const formatDateLong = (dateTimeStr) => {
    if (!dateTimeStr) return "N/A";
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString("es-MX", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
};

export const RentalExternalItemsPage = () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const [rentals, setRentals] = useState([]);
    const [providers, setProviders] = useState([]);
    const [externalItemsByRental, setExternalItemsByRental] = useState({});
    const [selectedRental, setSelectedRental] = useState(null);
    const [loading, setLoading] = useState(true);

    // Cargar rentas con subcontrato y proveedores
    const loadData = async () => {
        setLoading(true);
        const [rentalsRes, providersRes] = await Promise.all([
            itemService.findRentalsWithSubcontract(),
            providerService.findAll()
        ]);
        if (rentalsRes?.data) {
            setRentals(rentalsRes.data);
            // Cargar external items de cada renta para saber pendientes vs completados
            const itemsMap = {};
            await Promise.all(rentalsRes.data.map(async (rental) => {
                const res = await itemService.findByRental(rental.id);
                if (res?.data) itemsMap[rental.id] = res.data;
            }));
            setExternalItemsByRental(itemsMap);
        }
        if (providersRes?.data) setProviders(providersRes.data);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    // Determinar si una renta está completada
    const isRentalCompleted = (rental) => {
        const subItems = rental.items?.filter(i => i.subcontractedQuantity > 0) || [];
        if (subItems.length === 0) return false;

        const externalItems = externalItemsByRental[rental.id] || [];

        return subItems.every(item => {
            const assignedQty = externalItems
                .filter(ext => ext.rentalItemId === item.id)
                .reduce((sum, ext) => sum + ext.quantity, 0);
            return assignedQty >= item.subcontractedQuantity;
        });
    };

    const pendingRentals = rentals.filter(r => !isRentalCompleted(r));
    const completedRentals = rentals.filter(r => isRentalCompleted(r));

    const handleOpenModal = (rental) => {
        setSelectedRental(rental);
    };

    const handleCloseModal = () => {
        setSelectedRental(null);
        loadData(); // Recargar al cerrar
    };

    const RentalCard = ({ rental, isPending }) => {
        const status = statusConfig[rental.status] || statusConfig.CREATED;
        const subItemsCount = rental.items?.filter(i => i.subcontractedQuantity > 0).length || 0;

        const rentalTotal = rental.total || 0;
        const externalItems = externalItemsByRental[rental.id] || [];
        const totalExternalCost = externalItems.reduce((sum, ext) => sum + (ext.quantity * ext.unitCost), 0);
        const profitability = rentalTotal - totalExternalCost;

        return (
            <div className="col-12 col-sm-6 col-lg-4 col-xl-3 mb-3">
                <div
                    className="card h-100 shadow-sm"
                    style={{ cursor: "pointer", transition: "transform 0.2s" }}
                    onClick={() => handleOpenModal(rental)}
                    onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
                >
                    <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="fw-bold mb-0">#{rental.id}</h6>
                            <div className="d-flex gap-1">
                                <span className={`badge ${status.class}`}>
                                    <i className={`bi ${status.icon} me-1`}></i>
                                    {status.label}
                                </span>
                                <span className={`badge ${isPending ? "bg-warning text-dark" : "bg-success"}`}>
                                    {isPending ? "Pendiente" : "Completado"}
                                </span>
                            </div>
                        </div>

                        <div className="small mb-1">
                            <i className="bi bi-person me-1 text-primary"></i>
                            {rental.client?.name || "Sin cliente"}
                        </div>
                        <div className="small mb-1 text-muted">
                            <i className="bi bi-geo-alt me-1"></i>
                            {rental.address || "Sin dirección"}
                        </div>
                        <div className="small mb-1 text-muted text-capitalize">
                            <i className="bi bi-calendar-event me-1"></i>
                            <strong>Inicio:</strong> {formatDateLong(rental.startDate)}
                        </div>
                        <div className="small mb-2 text-muted text-capitalize">
                            <i className="bi bi-calendar-check me-1"></i>
                            <strong>Fin:</strong> {formatDateLong(rental.endDate)}
                        </div>

                        <div className="small mb-2">
                            <i className="bi bi-truck me-1"></i>
                            {subItemsCount} producto(s) subcontratado(s)
                        </div>

                        <hr className="my-2" />

                        <div className="d-flex justify-content-between small mb-1">
                            <span className="text-muted">Total renta:</span>
                            <strong className="text-dark">${rentalTotal.toLocaleString()}</strong>
                        </div>
                        <div className="d-flex justify-content-between small mb-1">
                            <span className="text-muted">Costo subcontratado:</span>
                            <strong className="text-danger">-${totalExternalCost.toLocaleString()}</strong>
                        </div>
                        <div className="d-flex justify-content-between small">
                            <span className="text-muted">Rentabilidad:</span>
                            <strong className={profitability >= 0 ? "text-success" : "text-danger"}>
                                ${profitability.toLocaleString()}
                            </strong>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <ModuleHeader title="Mobiliario Subcontratado" />

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status"></div>
                    <p className="mt-2 text-muted">Cargando rentas con subcontrato...</p>
                </div>
            ) : rentals.length === 0 ? (
                <div className="text-center text-muted py-5">
                    <i className="bi bi-truck" style={{ fontSize: "3rem" }}></i>
                    <p className="mt-3 fs-5">No hay rentas con subcontrato</p>
                    <p className="small">Marca productos como subcontratados en el wizard de rentas para verlos aquí</p>
                </div>
            ) : (
                <>
                    {/* Pendientes */}
                    {pendingRentals.length > 0 && (
                        <div className="mb-4">
                            <h5 className="mb-3">
                                <i className="bi bi-clock-history me-2 text-warning"></i>
                                Pendientes de completar
                                <span className="badge bg-warning text-dark ms-2">{pendingRentals.length}</span>
                            </h5>
                            <div className="row">
                                {pendingRentals.map(rental => (
                                    <RentalCard key={rental.id} rental={rental} isPending={true} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Completados */}
                    {completedRentals.length > 0 && (
                        <div className="mb-4">
                            <h5 className="mb-3">
                                <i className="bi bi-check-circle me-2 text-success"></i>
                                Completados
                                <span className="badge bg-success ms-2">{completedRentals.length}</span>
                            </h5>
                            <div className="row">
                                {completedRentals.map(rental => (
                                    <RentalCard key={rental.id} rental={rental} isPending={false} />
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}

            {selectedRental && (
                <SubcontractModal
                    rental={selectedRental}
                    providers={providers}
                    currentUser={currentUser}
                    onClose={handleCloseModal}
                />
            )}
        </>
    );
};
