import { useState, useEffect, useRef, useMemo } from "react";
import * as quotationService from "../services/quotationService";
import * as productService from "../services/productService";
import { ModuleHeader } from "../components/common/ModuleHeader";
import { SearchInput } from "../components/common/SearchInput";
import { useProductFilter } from "../hooks/useProductFilter";
import Swal from "sweetalert2";

const emptyForm = { items: [], notes: "" };
const PAGE_SIZE_OPTIONS = [10, 20, 50];

export const QuotationsPage = () => {
    const currentUser = JSON.parse(localStorage.getItem("user"));

    const [quotations, setQuotations] = useState([]);
    const [showInactive, setShowInactive] = useState(false);
    const [products, setProducts] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [selectedQuotation, setSelectedQuotation] = useState(null);
    const previewRef = useRef(null);

    // Buscador y paginacion de productos
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    useEffect(() => {
        productService.findAll().then((res) => {
            if (res) setProducts(res.data.filter(p => p.active !== false));
        });
    }, []);

    const filteredProducts = useProductFilter(products, searchTerm);

    // Paginacion
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredProducts.slice(start, start + pageSize);
    }, [filteredProducts, currentPage, pageSize]);

    // Reset pagina al buscar o cambiar tamaño
    useEffect(() => { setCurrentPage(1); }, [searchTerm, pageSize]);

    const loadQuotations = async () => {
        const res = showInactive
            ? await quotationService.findInactive()
            : await quotationService.findAll();
        if (res) setQuotations(res.data);
    };

    useEffect(() => { loadQuotations(); }, [showInactive]);

    const addProduct = (product) => {
        const existing = form.items.find(i => i.productId === product.id);
        if (existing) return;
        setForm({
            ...form,
            items: [...form.items, {
                productId: product.id,
                name: product.name,
                price: product.price,
                imageUrl: product.imageUrl,
                quantity: 1
            }]
        });
    };

    const updateQuantity = (productId, rawValue) => {
        // No eliminar al borrar — solo actualizar el valor
        const value = rawValue === "" ? "" : Number(rawValue);
        setForm({
            ...form,
            items: form.items.map(i => i.productId === productId ? { ...i, quantity: value } : i)
        });
    };

    const removeItem = (productId) => {
        setForm({ ...form, items: form.items.filter(i => i.productId !== productId) });
    };

    const calculateTotal = () => {
        return form.items.reduce((sum, item) => {
            const qty = item.quantity === "" ? 0 : item.quantity;
            return sum + qty * item.price;
        }, 0);
    };

    const handleSave = async () => {
        if (form.items.length === 0) {
            Swal.fire("Error", "Agrega al menos un producto", "error");
            return;
        }
        const invalidItem = form.items.find(i => !i.quantity || i.quantity <= 0);
        if (invalidItem) {
            Swal.fire("Error", `La cantidad de "${invalidItem.name}" debe ser mayor a 0`, "error");
            return;
        }
        const data = {
            items: form.items.map(i => ({ productId: i.productId, quantity: i.quantity })),
            notes: form.notes,
            userId: currentUser.id,
            total: calculateTotal()
        };
        if (editingId) {
            await quotationService.update(editingId, data);
            Swal.fire("Cotizacion actualizada", "", "success");
        } else {
            await quotationService.create(data);
            Swal.fire("Cotizacion creada", "", "success");
        }
        setIsCreating(false);
        setEditingId(null);
        setForm(emptyForm);
        loadQuotations();
    };

    const handleEdit = (q) => {
        setEditingId(q.id);
        setForm({
            items: q.items.map(i => ({
                productId: i.productId,
                name: i.productName,
                price: i.price,
                quantity: i.quantity
            })),
            notes: q.notes || ""
        });
        setIsCreating(true);
    };

    const handleDeactivate = async (id) => {
        const result = await Swal.fire({
            title: "Desactivar cotizacion?",
            input: "textarea",
            inputLabel: "Motivo",
            inputPlaceholder: "Escribe el motivo...",
            inputValidator: (value) => { if (!value) return "El motivo es obligatorio"; },
            showCancelButton: true,
            confirmButtonText: "Desactivar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33"
        });
        if (result.isConfirmed) {
            await quotationService.deactivate(id, result.value, currentUser.id);
            loadQuotations();
        }
    };

    const handleActivate = async (id) => {
        const result = await Swal.fire({
            title: "Reactivar cotizacion?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Si, reactivar",
            cancelButtonText: "Cancelar"
        });
        if (result.isConfirmed) {
            await quotationService.activate(id);
            loadQuotations();
        }
    };

    // Convierte una URL de imagen a base64 para que html2pdf la pueda renderizar
    const toBase64 = (url) => {
        return new Promise((resolve) => {
            if (!url) { resolve(null); return; }
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;
                canvas.getContext("2d").drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/jpeg", 0.8));
            };
            img.onerror = () => resolve(null);
            img.src = url;
        });
    };

    const handleExportPdf = async (quotation) => {
        // Pre-convertir imagenes a base64
        const itemsWithBase64 = await Promise.all(
            quotation.items.map(async (item) => ({
                ...item,
                imageBase64: await toBase64(item.productImageUrl)
            }))
        );
        setSelectedQuotation({ ...quotation, items: itemsWithBase64 });

        setTimeout(async () => {
            const element = previewRef.current;
            if (!element) return;
            const html2pdf = (await import("html2pdf.js")).default;
            html2pdf()
                .set({
                    margin: 10,
                    filename: `Cotizacion_${quotation.id}.pdf`,
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true },
                    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" }
                })
                .from(element)
                .save()
                .then(() => setSelectedQuotation(null));
        }, 300);
    };

    const formatMoney = (amount) => "$" + (amount || 0).toLocaleString();

    return (
        <div className="container-fluid py-4">
            <ModuleHeader title="Cotizaciones">
                <div className="col-auto">
                    <button className="btn btn-primary" onClick={() => { setIsCreating(true); setEditingId(null); setForm(emptyForm); }}>
                        <i className="bi bi-plus-lg me-1"></i> Nueva Cotizacion
                    </button>
                </div>
                <div className="col-auto">
                    <div className="btn-group">
                        <button
                            className={`btn ${!showInactive ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setShowInactive(false)}
                        >
                            <i className="bi bi-eye me-1"></i> Activas
                        </button>
                        <button
                            className={`btn ${showInactive ? "btn-primary" : "btn-outline-secondary"}`}
                            onClick={() => setShowInactive(true)}
                        >
                            <i className="bi bi-eye-slash me-1"></i> Inactivas
                        </button>
                    </div>
                </div>
            </ModuleHeader>

            {/* Formulario de creacion */}
            {isCreating && (
                <div className="card mb-4">
                    <div className="card-header d-flex justify-content-between align-items-center">
                        <strong>{editingId ? `Editar Cotizacion #${editingId}` : "Nueva Cotizacion"}</strong>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => { setIsCreating(false); setEditingId(null); setForm(emptyForm); }}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                    </div>
                    <div className="card-body">
                        <div className="row">
                            {/* Productos disponibles — cards con buscador y paginacion */}
                            <div className="col-12 col-md-7">
                                <h6>Productos disponibles</h6>
                                <div className="mb-3">
                                    <SearchInput
                                        value={searchTerm}
                                        onChange={setSearchTerm}
                                        placeholder="Buscar por nombre, precio, color..."
                                    />
                                </div>

                                <div className="row g-2">
                                    {paginatedProducts.map(product => {
                                        const isAdded = form.items.some(i => i.productId === product.id);
                                        return (
                                            <div key={product.id} className="col-6 col-lg-4">
                                                <div className={`card h-100 ${isAdded ? "border-primary" : ""}`}
                                                     style={{ cursor: isAdded ? "default" : "pointer", opacity: isAdded ? 0.6 : 1 }}
                                                     onClick={() => !isAdded && addProduct(product)}>
                                                    <img
                                                        src={product.imageUrl || "https://via.placeholder.com/300"}
                                                        className="card-img-top"
                                                        style={{ height: "100px", objectFit: "cover" }}
                                                        alt={product.name}
                                                    />
                                                    <div className="card-body p-2">
                                                        <h6 className="mb-0 small fw-bold">{product.name}</h6>
                                                        <span className="badge bg-success mt-1">{formatMoney(product.price)}</span>
                                                        {isAdded && (
                                                            <span className="badge bg-primary ms-1 mt-1">Agregado</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Paginacion */}
                                <div className="d-flex justify-content-between align-items-center mt-3">
                                    <div className="d-flex align-items-center gap-2">
                                        <small className="text-muted">Mostrar:</small>
                                        <select className="form-select form-select-sm" style={{ width: "70px" }}
                                                value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))}>
                                            {PAGE_SIZE_OPTIONS.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="d-flex align-items-center gap-1">
                                        <button className="btn btn-sm btn-outline-secondary"
                                                disabled={currentPage <= 1}
                                                onClick={() => setCurrentPage(currentPage - 1)}>
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                        <small className="text-muted mx-2">
                                            {currentPage} / {totalPages}
                                        </small>
                                        <button className="btn btn-sm btn-outline-secondary"
                                                disabled={currentPage >= totalPages}
                                                onClick={() => setCurrentPage(currentPage + 1)}>
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </div>
                                    <small className="text-muted">{filteredProducts.length} productos</small>
                                </div>
                            </div>

                            {/* Items seleccionados */}
                            <div className="col-12 col-md-5">
                                <h6>Productos seleccionados</h6>
                                {form.items.length === 0 ? (
                                    <p className="text-muted">Selecciona productos de las cards</p>
                                ) : (
                                    <>
                                        <table className="table table-sm table-bordered">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>Producto</th>
                                                    <th style={{ width: "80px" }}>Cant.</th>
                                                    <th>Subtotal</th>
                                                    <th style={{ width: "40px" }}></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {form.items.map(item => (
                                                    <tr key={item.productId}>
                                                        <td className="small">{item.name}</td>
                                                        <td>
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                value={item.quantity}
                                                                min="1"
                                                                onChange={(e) => updateQuantity(item.productId, e.target.value)}
                                                            />
                                                        </td>
                                                        <td>{formatMoney((item.quantity || 0) * item.price)}</td>
                                                        <td>
                                                            <button className="btn btn-sm btn-outline-danger"
                                                                    onClick={() => removeItem(item.productId)}>
                                                                <i className="bi bi-x"></i>
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        <div className="text-end fs-5 fw-bold mb-3">
                                            Total: {formatMoney(calculateTotal())}
                                        </div>
                                    </>
                                )}

                                <textarea
                                    className="form-control mb-3"
                                    placeholder="Notas (opcional)"
                                    rows="2"
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                />
                                <button className="btn btn-primary w-100" onClick={handleSave}>
                                    <i className="bi bi-check-lg me-1"></i> {editingId ? "Actualizar Cotizacion" : "Guardar Cotizacion"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Lista de cotizaciones */}
            <div className="row g-3">
                {quotations.length === 0 ? (
                    <p className="text-muted">No hay cotizaciones registradas</p>
                ) : (
                    quotations.map(q => (
                        <div key={q.id} className="col-12 col-md-6 col-lg-4">
                            <div className="card h-100">
                                <div className="card-header d-flex justify-content-between align-items-center"
                                     style={!q.active ? { opacity: 0.5 } : {}}>
                                    <strong>Cotizacion #{q.id}</strong>
                                    <span className="badge bg-secondary">
                                        {new Date(q.createdAt).toLocaleDateString("es-MX")}
                                    </span>
                                </div>
                                <div className="card-body" style={!q.active ? { opacity: 0.5 } : {}}>
                                    <table className="table table-sm mb-2">
                                        <thead>
                                            <tr>
                                                <th>Producto</th>
                                                <th>Cant.</th>
                                                <th>Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {q.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td>{item.productName}</td>
                                                    <td>{item.quantity}</td>
                                                    <td>{formatMoney(item.subtotal)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="text-end fw-bold fs-5">
                                        Total: {formatMoney(q.total)}
                                    </div>
                                    {q.notes && <p className="text-muted small mt-1 mb-0">{q.notes}</p>}
                                </div>
                                <div className="card-footer d-flex gap-2">
                                    {q.active ? (
                                        <>
                                            <button className="btn btn-sm btn-outline-primary"
                                                    onClick={() => handleEdit(q)}>
                                                <i className="bi bi-pencil me-1"></i> Editar
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger"
                                                    onClick={() => handleExportPdf(q)}>
                                                <i className="bi bi-file-earmark-pdf me-1"></i> PDF
                                            </button>
                                            <button className="btn btn-sm btn-outline-danger ms-auto"
                                                    onClick={() => handleDeactivate(q.id)}>
                                                <i className="bi bi-trash me-1"></i> Desactivar
                                            </button>
                                        </>
                                    ) : (
                                        <button className="btn btn-sm btn-outline-success"
                                                onClick={() => handleActivate(q.id)}>
                                            <i className="bi bi-arrow-counterclockwise me-1"></i> Reactivar
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Preview oculto para generar PDF */}
            {selectedQuotation && (
                <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
                    <div ref={previewRef} style={{ width: "700px", padding: "30px", fontFamily: "Arial, sans-serif", background: "#fff" }}>
                        {/* Header con gradiente */}
                        <div style={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            borderRadius: "12px",
                            padding: "25px",
                            textAlign: "center",
                            marginBottom: "25px",
                            color: "#fff"
                        }}>
                            <h1 style={{ margin: 0, fontSize: "1.8em", letterSpacing: "2px" }}>ChukisApp</h1>
                            <p style={{ margin: "5px 0 0", fontSize: "0.95em", opacity: 0.9 }}>Renta de Mobiliario</p>
                        </div>

                        {/* Titulo y fecha */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                            <h2 style={{ margin: 0, color: "#333" }}>Cotizacion #{selectedQuotation.id}</h2>
                            <div style={{
                                background: "#f0f0f0",
                                borderRadius: "8px",
                                padding: "6px 14px",
                                fontSize: "0.9em",
                                color: "#555"
                            }}>
                                {new Date(selectedQuotation.createdAt).toLocaleDateString("es-MX", {
                                    year: "numeric", month: "long", day: "numeric"
                                })}
                            </div>
                        </div>

                        {selectedQuotation.notes && (
                            <div style={{
                                background: "#f8f4ff",
                                border: "1px solid #e0d4f5",
                                borderRadius: "8px",
                                padding: "10px 15px",
                                marginBottom: "20px",
                                fontSize: "0.9em",
                                color: "#555"
                            }}>
                                <strong>Notas:</strong><br />
                                <span dangerouslySetInnerHTML={{ __html: selectedQuotation.notes.replace(/\n/g, "<br />") }}></span>
                            </div>
                        )}

                        {/* Cards de productos en cuadricula — 4 por fila */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "20px" }}>
                            {selectedQuotation.items.map((item, idx) => (
                                <div key={idx} style={{
                                    width: "calc(25% - 6px)",
                                    border: "1px solid #e0e0e0",
                                    borderRadius: "8px",
                                    overflow: "hidden",
                                    background: "#fff",
                                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)"
                                }}>
                                    {(item.imageBase64 || item.productImageUrl) && (
                                        <img
                                            src={item.imageBase64 || item.productImageUrl}
                                            alt={item.productName}
                                            style={{ width: "100%", height: "120px", objectFit: "cover" }}
                                        />
                                    )}
                                    <div style={{ padding: "6px 8px" }}>
                                        <div style={{ fontWeight: "bold", fontSize: "0.75em", marginBottom: "4px", color: "#333" }}>
                                            {item.productName}
                                        </div>
                                        <div style={{ fontSize: "0.7em", color: "#666" }}>
                                            {formatMoney(item.price)} x {item.quantity}
                                        </div>
                                        <div style={{
                                            fontSize: "0.8em",
                                            fontWeight: "bold",
                                            color: "#667eea",
                                            marginTop: "4px",
                                            paddingTop: "4px",
                                            borderTop: "1px solid #eee"
                                        }}>
                                            {formatMoney(item.subtotal)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Total */}
                        <div style={{
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            borderRadius: "10px",
                            padding: "15px 20px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            color: "#fff"
                        }}>
                            <span style={{ fontSize: "1.1em", fontWeight: "600" }}>TOTAL</span>
                            <span style={{ fontSize: "1.4em", fontWeight: "bold" }}>{formatMoney(selectedQuotation.total)}</span>
                        </div>

                        {/* Footer */}
                        <div style={{ marginTop: "30px", textAlign: "center", color: "#aaa", fontSize: "0.8em" }}>
                            <p style={{ margin: "4px 0" }}>Esta cotizacion es informativa y no representa un compromiso de reserva.</p>
                            <p style={{ margin: "4px 0" }}>Precios sujetos a cambios sin previo aviso.</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
