import { useState, useEffect, useRef } from "react";
import { findWithContract } from "../services/rentalService";
import { ModuleHeader } from "../components/common/ModuleHeader";
import { ContractPreview } from "../components/contracts/ContractPreview";

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("es-MX", {
        year: "numeric", month: "short", day: "numeric"
    });
};

const formatMoney = (amount) => "$" + (amount || 0).toLocaleString();

const statusLabels = {
    CREATED: { label: "Creada", class: "bg-info" },
    DELIVERED: { label: "Entregada", class: "bg-warning" },
    PICKED_UP: { label: "Recogida", class: "bg-success" },
    CANCELLED: { label: "Cancelada", class: "bg-danger" }
};

export const ContractsPage = () => {
    const [rentals, setRentals] = useState([]);
    const [contractRental, setContractRental] = useState(null);
    const contractRef = useRef(null);

    const loadRentals = async () => {
        const res = await findWithContract();
        if (res) setRentals(res.data);
    };

    useEffect(() => {
        loadRentals();
    }, []);

    const handleDownload = async (rental) => {
        setContractRental(rental);
        setTimeout(async () => {
            const element = contractRef.current;
            if (!element) return;
            const html2pdf = (await import("html2pdf.js")).default;
            html2pdf()
                .set({
                    margin: [8, 10, 8, 10],
                    filename: `Contrato_Renta_${rental.id}.pdf`,
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: { scale: 2 },
                    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
                })
                .from(element)
                .save()
                .then(() => setContractRental(null));
        }, 200);
    };

    return (
        <div className="container-fluid py-4">
            <ModuleHeader title="Contratos" />

            {rentals.length === 0 ? (
                <p className="text-muted">No hay contratos generados. Genera uno desde el modulo de Rentas.</p>
            ) : (
                <div className="row g-3">
                    {rentals.map(rental => {
                        const status = statusLabels[rental.status] || statusLabels.CREATED;
                        return (
                            <div key={rental.id} className="col-12 col-md-6 col-lg-4">
                                <div className="card h-100">
                                    <div className="card-header d-flex justify-content-between align-items-center">
                                        <strong>Contrato R-{rental.id}</strong>
                                        <span className={`badge ${status.class}`}>{status.label}</span>
                                    </div>
                                    <div className="card-body">
                                        <div className="mb-2">
                                            <i className="bi bi-person me-1 text-primary"></i>
                                            <strong>{rental.client?.name}</strong>
                                        </div>
                                        <div className="mb-1 small text-muted">
                                            <i className="bi bi-telephone me-1"></i>
                                            {rental.client?.phone || "—"}
                                        </div>
                                        <div className="mb-1 small text-muted">
                                            <i className="bi bi-geo-alt me-1"></i>
                                            {rental.address}
                                        </div>
                                        <div className="mb-1 small text-muted">
                                            <i className="bi bi-calendar me-1"></i>
                                            {formatDate(rental.startDate)} — {formatDate(rental.endDate)}
                                        </div>
                                        <div className="mb-2">
                                            <i className="bi bi-box-seam me-1"></i>
                                            <span className="badge bg-secondary">{rental.items?.length || 0} productos</span>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="fw-bold text-success fs-5">{formatMoney(rental.total)}</span>
                                            <small className="text-muted">
                                                <i className="bi bi-file-earmark-check me-1"></i>
                                                {formatDate(rental.contractDate)}
                                            </small>
                                        </div>
                                    </div>
                                    <div className="card-footer">
                                        <button
                                            className="btn btn-sm btn-outline-danger w-100"
                                            onClick={() => handleDownload(rental)}
                                        >
                                            <i className="bi bi-file-earmark-pdf me-1"></i>
                                            Descargar Contrato PDF
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Preview oculto para generar PDF */}
            {contractRental && (
                <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
                    <ContractPreview ref={contractRef} rental={contractRental} />
                </div>
            )}
        </div>
    );
};
