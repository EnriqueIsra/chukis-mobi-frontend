import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Swal from "sweetalert2";
import * as itemService from "../../services/rentalExternalItemService";

const formatDateShort = (dateTimeStr) => {
    if (!dateTimeStr) return "N/A";
    const date = new Date(dateTimeStr);
    return date.toLocaleString("es-MX", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
};

export const SubcontractModal = ({ rental, providers, currentUser, onClose }) => {
    const [externalItems, setExternalItems] = useState([]);
    const [profitability, setProfitability] = useState(null);
    const [assigningItemId, setAssigningItemId] = useState(null);
    const [assignForm, setAssignForm] = useState({ providerId: "", quantity: "", unitCost: "", notes: "" });
    const [loading, setLoading] = useState(true);

    const loadExternalData = async () => {
        const [itemsRes, profRes] = await Promise.all([
            itemService.findByRental(rental.id),
            itemService.getProfitability(rental.id)
        ]);
        if (itemsRes?.data) setExternalItems(itemsRes.data);
        if (profRes?.data) setProfitability(profRes.data);
        setLoading(false);
    };

    useEffect(() => {
        loadExternalData();
    }, [rental.id]);

    // Items de la renta que tienen subcontrato
    const subcontractedItems = rental.items?.filter(i => i.subcontractedQuantity > 0) || [];

    const getAssignedQty = (rentalItemId) => {
        return externalItems
            .filter(ext => ext.rentalItemId === rentalItemId)
            .reduce((sum, ext) => sum + ext.quantity, 0);
    };

    const getRemainingQty = (item) => {
        return item.subcontractedQuantity - getAssignedQty(item.id);
    };

    const handleAssignSubmit = async (rentalItemId) => {
        const { providerId, quantity, unitCost, notes } = assignForm;
        if (!providerId || !quantity || !unitCost) {
            Swal.fire({ icon: "warning", title: "Campos requeridos", text: "Proveedor, cantidad y costo son obligatorios" });
            return;
        }

        const remaining = getRemainingQty(subcontractedItems.find(i => i.id === rentalItemId));
        if (Number(quantity) > remaining) {
            Swal.fire({ icon: "warning", title: "Excede el límite", text: `Solo quedan ${remaining} unidades por asignar` });
            return;
        }

        const result = await itemService.create({
            rentalItemId,
            providerId: Number(providerId),
            quantity: Number(quantity),
            unitCost: Number(unitCost),
            notes
        });

        if (!result) {
            Swal.fire({ icon: "error", title: "Error", text: "No se pudo asignar el proveedor. Revisa la consola para más detalles." });
            return;
        }

        Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Proveedor asignado", showConfirmButton: false, timer: 2000 });

        setAssigningItemId(null);
        setAssignForm({ providerId: "", quantity: "", unitCost: "", notes: "" });
        await loadExternalData();
    };

    const handleDeleteExternal = async (extItem) => {
        const result = await Swal.fire({
            title: "¿Eliminar asignación?",
            text: `Se eliminará la asignación de ${extItem.quantity} unidades de ${extItem.providerName}`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33"
        });
        if (result.isConfirmed) {
            await itemService.deactivate(extItem.id, "Eliminado desde modal de subcontrato", currentUser.id);
            await loadExternalData();
        }
    };

    return (
        <>
            <div className="modal-backdrop fade show" onClick={onClose} style={{ zIndex: 1040 }}></div>
            <div className="modal fade show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
                <div className="modal-dialog modal-xl modal-dialog-centered modal-dialog-scrollable">
                    <div className="modal-content">
                        {/* Header */}
                        <div className="modal-header">
                            <h5 className="modal-title">
                                <i className="bi bi-truck me-2"></i>
                                Subcontrato — Renta #{rental.id}
                            </h5>
                            <button type="button" className="btn-close" onClick={onClose}></button>
                        </div>

                        {/* Body */}
                        <div className="modal-body">
                            {/* Info de la renta */}
                            <div className="alert alert-light border mb-3">
                                <div className="row small">
                                    <div className="col-md-4">
                                        <i className="bi bi-person me-1"></i>
                                        <strong>{rental.client?.name}</strong> · {rental.client?.phone}
                                    </div>
                                    <div className="col-md-4">
                                        <i className="bi bi-geo-alt me-1"></i>
                                        {rental.address}
                                    </div>
                                    <div className="col-md-4">
                                        <i className="bi bi-calendar-range me-1"></i>
                                        {formatDateShort(rental.startDate)} — {formatDateShort(rental.endDate)}
                                    </div>
                                </div>
                            </div>

                            {loading ? (
                                <div className="text-center py-4">
                                    <div className="spinner-border text-primary"></div>
                                </div>
                            ) : (
                                <>
                                    {/* Tabla de productos */}
                                    <h6 className="fw-bold mb-2">Productos de la renta</h6>
                                    <div className="table-responsive mb-3">
                                        <table className="table table-bordered table-sm">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>Producto</th>
                                                    <th>Cantidad total</th>
                                                    <th>Propias</th>
                                                    <th>Subcontratadas</th>
                                                    <th>Precio cliente</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {rental.items?.map(item => (
                                                    <tr key={item.id} className={item.subcontractedQuantity > 0 ? "table-warning" : ""}>
                                                        <td>{item.productName}</td>
                                                        <td>{item.quantity}</td>
                                                        <td>{item.quantity - (item.subcontractedQuantity || 0)}</td>
                                                        <td>
                                                            {item.subcontractedQuantity > 0 ? (
                                                                <span className="badge bg-warning text-dark">
                                                                    {item.subcontractedQuantity}
                                                                </span>
                                                            ) : "—"}
                                                        </td>
                                                        <td>${item.unitPrice}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Asignación de proveedores por producto subcontratado */}
                                    {subcontractedItems.length > 0 && (
                                        <>
                                            <h6 className="fw-bold mb-2">Asignación de proveedores</h6>
                                            {subcontractedItems.map(item => {
                                                const remaining = getRemainingQty(item);
                                                const assignedExternals = externalItems.filter(ext => ext.rentalItemId === item.id);

                                                return (
                                                    <div key={item.id} className="card mb-3">
                                                        <div className="card-header d-flex justify-content-between align-items-center">
                                                            <span>
                                                                <strong>{item.productName}</strong>
                                                                <span className="text-muted ms-2">
                                                                    ({item.subcontractedQuantity} subcontratadas)
                                                                </span>
                                                            </span>
                                                            <span className={`badge ${remaining === 0 ? "bg-success" : "bg-warning text-dark"}`}>
                                                                {remaining === 0 ? "Completo" : `${remaining} por asignar`}
                                                            </span>
                                                        </div>
                                                        <div className="card-body">
                                                            {/* Lista de proveedores asignados */}
                                                            {assignedExternals.length > 0 && (
                                                                <table className="table table-sm mb-2">
                                                                    <thead>
                                                                        <tr>
                                                                            <th>Proveedor</th>
                                                                            <th>Cantidad</th>
                                                                            <th>Costo unitario</th>
                                                                            <th>Total</th>
                                                                            <th>Notas</th>
                                                                            <th></th>
                                                                        </tr>
                                                                    </thead>
                                                                    <tbody>
                                                                        {assignedExternals.map(ext => (
                                                                            <tr key={ext.id}>
                                                                                <td>{ext.providerName}</td>
                                                                                <td>{ext.quantity}</td>
                                                                                <td>${ext.unitCost}</td>
                                                                                <td>${ext.totalCost}</td>
                                                                                <td className="small text-muted">{ext.notes || "—"}</td>
                                                                                <td>
                                                                                    <button
                                                                                        className="btn btn-sm btn-outline-danger"
                                                                                        onClick={() => handleDeleteExternal(ext)}
                                                                                        title="Eliminar"
                                                                                    >
                                                                                        <i className="bi bi-trash"></i>
                                                                                    </button>
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                    </tbody>
                                                                </table>
                                                            )}

                                                            {/* Formulario de asignación */}
                                                            {remaining > 0 && (
                                                                assigningItemId === item.id ? (
                                                                    <div className="border rounded p-2 bg-light">
                                                                        <div className="row g-2 align-items-end">
                                                                            <div className="col-md-3">
                                                                                <label className="form-label small">Proveedor</label>
                                                                                <select
                                                                                    className="form-select form-select-sm"
                                                                                    value={assignForm.providerId}
                                                                                    onChange={e => setAssignForm({ ...assignForm, providerId: e.target.value })}
                                                                                >
                                                                                    <option value="">Seleccionar...</option>
                                                                                    {providers.map(p => (
                                                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                                                    ))}
                                                                                </select>
                                                                            </div>
                                                                            <div className="col-md-2">
                                                                                <label className="form-label small">Cantidad (max {remaining})</label>
                                                                                <input
                                                                                    type="number"
                                                                                    className="form-control form-control-sm"
                                                                                    min="1"
                                                                                    max={remaining}
                                                                                    value={assignForm.quantity}
                                                                                    onChange={e => setAssignForm({ ...assignForm, quantity: e.target.value })}
                                                                                />
                                                                            </div>
                                                                            <div className="col-md-2">
                                                                                <label className="form-label small">Costo unitario</label>
                                                                                <input
                                                                                    type="number"
                                                                                    className="form-control form-control-sm"
                                                                                    min="1"
                                                                                    value={assignForm.unitCost}
                                                                                    onChange={e => setAssignForm({ ...assignForm, unitCost: e.target.value })}
                                                                                />
                                                                            </div>
                                                                            <div className="col-md-3">
                                                                                <label className="form-label small">Notas</label>
                                                                                <input
                                                                                    type="text"
                                                                                    className="form-control form-control-sm"
                                                                                    placeholder="Opcional"
                                                                                    value={assignForm.notes}
                                                                                    onChange={e => setAssignForm({ ...assignForm, notes: e.target.value })}
                                                                                />
                                                                            </div>
                                                                            <div className="col-md-2 d-flex gap-1">
                                                                                <button
                                                                                    className="btn btn-sm btn-success"
                                                                                    onClick={() => handleAssignSubmit(item.id)}
                                                                                >
                                                                                    <i className="bi bi-check-lg"></i>
                                                                                </button>
                                                                                <button
                                                                                    className="btn btn-sm btn-outline-secondary"
                                                                                    onClick={() => {
                                                                                        setAssigningItemId(null);
                                                                                        setAssignForm({ providerId: "", quantity: "", unitCost: "", notes: "" });
                                                                                    }}
                                                                                >
                                                                                    <i className="bi bi-x-lg"></i>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        className="btn btn-sm btn-outline-primary"
                                                                        onClick={() => {
                                                                            setAssigningItemId(item.id);
                                                                            setAssignForm({ providerId: "", quantity: "", unitCost: "", notes: "" });
                                                                        }}
                                                                    >
                                                                        <i className="bi bi-plus-lg me-1"></i>
                                                                        Asignar proveedor
                                                                    </button>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </>
                                    )}

                                    {/* Rentabilidad */}
                                    {profitability && (
                                        <div className={`card mt-3 border-${profitability.netProfit >= 0 ? "success" : "danger"}`}>
                                            <div className="card-body">
                                                <h6 className="fw-bold mb-3">Rentabilidad</h6>
                                                <div className="row text-center">
                                                    <div className="col-4">
                                                        <div className="text-muted small">Ingreso total</div>
                                                        <div className="fw-bold fs-5">${profitability.rentalTotal?.toLocaleString()}</div>
                                                    </div>
                                                    <div className="col-4">
                                                        <div className="text-muted small">Costo externo</div>
                                                        <div className="fw-bold fs-5 text-danger">-${profitability.totalExternalCost?.toLocaleString()}</div>
                                                    </div>
                                                    <div className="col-4">
                                                        <div className="text-muted small">Ganancia neta</div>
                                                        <div className={`fw-bold fs-5 ${profitability.netProfit >= 0 ? "text-success" : "text-danger"}`}>
                                                            ${profitability.netProfit?.toLocaleString()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

SubcontractModal.propTypes = {
    rental: PropTypes.object.isRequired,
    providers: PropTypes.array.isRequired,
    currentUser: PropTypes.object,
    onClose: PropTypes.func.isRequired
};
