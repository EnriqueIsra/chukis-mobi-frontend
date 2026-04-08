// useRef nos permite crear una referencia a un elemento del DOM
// Lo necesitamos para apuntar al contenedor oculto donde se renderiza el PDF
import { useState, useEffect, useRef } from "react";
import { ProductTable } from "../components/products/ProductTable";
import { ProductsToolbar } from "../components/products/ProductsToolbar";
import { ProductCard } from "../components/products/ProductCard";
import { ProductModal } from "../components/products/ProductModal";
import Swal from "sweetalert2";
import { findAll, findInactive, create, update, deactivate, activate } from "../services/productService";
import { ModuleHeader } from "../components/common/ModuleHeader";
import { ProductDetailModal } from "../components/products/ProductDetailModal";

export const ProductsPage = () => {

    const currentUser = JSON.parse(localStorage.getItem("user"));
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [productSelected, setProductSelected] = useState({
        id: 0, name: '', description: '', price: '', color: '', stock: '', imageUrl: ''
    });
    const [viewMode, setViewMode] = useState("cards");
    const [showInactive, setShowInactive] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    // Producto que se visualiza en el modal de detalles (galería de imágenes)
    const [detailProduct, setDetailProduct] = useState(null)

    // Referencia al div oculto donde se construye el HTML del reporte antes de convertirlo a PDF
    const reportRef = useRef(null);

    // Controla qué modo de reporte se está generando("cards" o "list")
    // Se usa para ajustar el ancho del contenedor: 700 px para cards (portrait), 1050 para lista (landscape)
    const [reportMode, setReportMode] = useState(null);

    const loadProducts = async () => {
        const result = showInactive ? await findInactive() : await findAll();
        const data = result?.data;
        if (Array.isArray(data)) {
            setProducts(data);
        } else if (Array.isArray(data?.content)) {
            setProducts(data.content);
        } else {
            setProducts([]);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [showInactive]);

    const filteredProducts = Array.isArray(products)
        ? products.filter(product => {
            const search = searchTerm.toLowerCase();
            return (
                product.name?.toLowerCase().includes(search) ||
                product.description?.toLowerCase().includes(search) ||
                product.color?.toLowerCase().includes(search) ||
                String(product.price).includes(search)
            );
        })
        : [];

    const handlerAddProduct = async (product) => {
        if (product.id > 0) {
            await update(product);
            Swal.fire({
                title: "Actualizado con éxito",
                text: `Producto ${product.name} actualizado con éxito`,
                icon: "success"
            });
        } else {
            await create(product);
            Swal.fire({
                title: "Creado con éxito",
                text: `Producto ${product.name} creado con éxito`,
                icon: "success"
            });
        }
        loadProducts();
    };

    const handlerProductSelected = (product) => {
        setProductSelected({ ...product });
        setIsModalOpen(true);
    };

    const handlerOpenModal = () => {
        setProductSelected({
            id: 0, name: '', description: '', price: '', color: '', stock: '', imageUrl: ''
        });
        setIsModalOpen(true);
    };

    const handlerCloseModal = () => {
        setIsModalOpen(false);
        setProductSelected({
            id: 0, name: '', description: '', price: '', color: '', stock: '', imageUrl: ''
        });
    };

    const handleDeactivate = async (id, reason) => {
        await deactivate(id, reason, currentUser.id);
        loadProducts();
    };

    const handleActivate = async (id) => {
        await activate(id);
        loadProducts();
    };

    // html2pdf.js no puede cargar imágenes de otro servidor (localhost:8080)
    // porque las trata como "externas" por CORS.
    // La solución: convertir cada imagen a base64 ANTES de generar el PDF.
    // Proceso: crear un Image -> dibujarlo en un Canvas -> extraer como dataURL
    const toBase64 = (url) => {
        return new Promise((resolve) => {
            if (!url) { resolve(null); return; }
            const img = new Image()
            img.crossOrigin = "anonymous"; // Permite leer imágenes de otro origen
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = img.width
                canvas.height = img.height
                canvas.getContext("2d").drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/jpeg", 0.8)) // Convierte a base64
            }
            img.onerror = () => resolve(null) // si falla, devuelve null
            img.src = url;
        })
    }

    const formatMoney = (amount) => "$" + (amount || 0).toLocaleString();

    // Función principal: recibe "cards" o "list" y genera el PDF correspondiente
    const handleGenerateReport = async (mode) => {
        // 1.- Filtrar solo productos activos
        const activeProducts = filteredProducts.filter(p => p.active !== false)

        // 2.- Convertir TODAS las imágenes a base64 en paralelo con Promise.all
        // Esto es necesario porque html2pdf no puede cargar imágenes externas
        const productsWithImages = await Promise.all(
            activeProducts.map(async (p) => ({
                ...p,
                imageBase64: await toBase64(p.imageUrl)
            }))
        )

        // 3.- Setear el modo para que el contenedor ajuste su ancho
        setReportMode(mode)

        // 4.- setTimeout: esperamos a que React re-renderice el contenedor con el nuevo ancho
        setTimeout(async () => {
            const container = reportRef.current
            if (!container) return

            // 5.- Limpiar contenido previo y construir el HTML dinámicamente
            // Usamos innerHTML porque html2pdf necesita un elemento DOM real, no JSX virtual
            container.innerHTML = ""

            // --- HEADER del reporte ---
            const header = document.createElement("div")
            header.style.cssText = "text-align:center;margin-bottom:20px;border-bottom:3px double #333;padding-bottom:15px"
            header.innerHTML = `
                <h1 style="font-size:18px;font-weight:bold;letter-spacing:3px;margin:0;color:#1a1a2e;">CHUKISAPP - RENTA DE MOBILIARIO </h1>
                <p style="font-size:13px;margin:8px 0 0;color:#333;font-weight:bold;">REPORTE DE INVENTARIO</p>
                <p style="font-size:10px;color:#666;margin:4px 0 0;">
                    Generado: ${new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })}
                    | Total: ${productsWithImages.length} productos
                </p>
            `
            container.appendChild(header)

            // --- CONTENIDO según el modo --- 
            if (mode === "cards") {
                // MODO CARDS: cuadrícula de 4 columnas con imagen, nombre, color, precio y stock
                const grid = document.createElement("div")
                grid.style.cssText = "display:flex;flex-wrap:wrap;gap:8px;"

                productsWithImages.forEach(p => {
                    const card = document.createElement("div")
                    // calc(25% - 6px) = 4 cards por fila, restando el gap
                    card.style.cssText = "width:calc(25% - 6px);border:1px solid #e0e0e0;border-radius:8px;overflow:hidden;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,0.06);"
                    card.innerHTML = `
                        ${p.imageBase64
                            ? `<img src="${p.imageBase64}" style="width:100%;height:70px;object-fit:cover;" />`
                            : `<div style="width:100%;height:70px;background:#f0f0f0;display:flex;align-items:center;color:#aaa;font-size:20px;">📦</div>`
                        }
                        <div style="padding:6px 8px;">
                            <div style="font-weight:bold;font-size:0.75em;color:#333;">${p.name}</div>
                            ${p.color ? `<div style="font-size:0.65rem;color:#888;">${p.color}</div>` : ""}
                            <div style="display:flex;justify-content:space-between;margin-top:4px;">
                                <span style="font-size:0.7em;color:#667eea;font-weight:bold;">${formatMoney(p.price)}</span>
                                <span style="font-size:0.7em;color:#555;">Stock: ${p.stock}</span>
                            </div>
                        </div>
                    `
                    grid.appendChild(card)
                })

                container.appendChild(grid)
            } else {
                // MODO LISTA: tabla con columnas Producto, Color, Descripción, Precio, Stock
                const table = document.createElement("table")
                table.style.cssText = "width:100%;border-collapse:collapse;font-size:10px;"
                table.innerHTML = `
                    <thead>
                        <tr style="background:#1a1a2e;color:#fff;">
                            <th style="padding:6px 8px; text-align:left;">Producto</th>
                            <th style="padding:6px 8px; text-align:left;">Color</th>
                            <th style="padding:6px 8px; text-align:left;">Descripción</th>
                            <th style="padding:6px 8px; text-align:right;">Precio</th>
                            <th style="padding:6px 8px; text-align:right;">Stock</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productsWithImages.map((p, idx) => `
                            <tr style="${idx % 2 !== 0 ? "background:#f9f9f9;" : ""}">
                                <td style="padding:5px 8px;border-bottom:1px solid #eee;font-weight:bold;">${p.name}</td>
                                <td style="padding:5px 8px;border-bottom:1px solid #eee;">${p.color || "-"}</td>
                                <td style="padding:5px 8px;border-bottom:1px solid #eee;">${p.description || "-"}</td>
                                <td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:right;">${formatMoney(p.price)}</td>
                                <td style="padding:5px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:bold;">${p.stock}</td>
                            </tr>
                            `).join("")}
                    </tbody>
                `
                container.appendChild(table)
            }
            // 6.- Generar el PDF usando html2pdf.js
            // import() dinámico: carga la librería solo cuando se necesita (no en cada render)
            const html2pdf = (await import("html2pdf.js")).default
            html2pdf()
                .set({
                    margin: 10,
                    filename: `Inventario_${mode === "cards" ? "Cards" : "Lista"}_${new Date().toISOString().slice(0, 10)}.pdf`,
                    image: { type: "jpeg", quality: 0.98 },
                    html2canvas: { scale: 2, useCORS: true }, // scale:2 mejor resolución
                    // portrait para cards (vertical), landscape para lista (horizontal, más espacio para columnas)
                    jsPDF: { unit: "mm", format: "a4", orientation: mode === "cards" ? "portrait" : "landscape" }
                })
                .from(container)    // Toma el elemento DOM como fuente
                .save()             // Descarga el PDF
                .then(() => setReportMode(null)) // Limpia el modo
        }, 300) // 300ms de espera para que React actualice el DOM
    }


    return (
        <>
            <ModuleHeader title="Productos">
                <div className="col-12 col-lg-auto">
                    <button
                        className="btn btn-primary w-100"
                        onClick={handlerOpenModal}
                    >
                        <i className="bi bi-plus-lg"></i> Agregar Nuevo Producto
                    </button>
                </div>

                <div className="col-12 col-lg">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Buscar por nombre, descripción, precio o color..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="col-12 col-lg-auto">
                    <ProductsToolbar
                        viewMode={viewMode}
                        setViewMode={setViewMode}
                    />
                </div>

                <div className="col-12 col-lg-auto">
                    <div className="btn-group">
                        <button
                            className={`btn btn-outline-secondary ${!showInactive ? "active" : ""}`}
                            onClick={() => setShowInactive(false)}
                        >
                            <i className="bi bi-eye me-1"></i>Activos
                        </button>
                        <button
                            className={`btn btn-outline-secondary ${showInactive ? "active" : ""}`}
                            onClick={() => setShowInactive(true)}
                        >
                            <i className="bi bi-eye-slash me-1"></i>Inactivos
                        </button>
                    </div>
                </div>

                {/* Botón dividido para generar el reporte PDF del inventario */}
                <div className="col-12 col-lg-auto">
                    <div className="btn-group">
                        <button
                            className="btn btn-outline-danger"
                            onClick={() => handleGenerateReport("cards")}
                        >
                            <i className="bi bi-grid me-1"></i>PDF Cards
                        </button>
                        <button
                            className="btn btn-outline-danger"
                            onClick={() => handleGenerateReport("list")}
                        >
                            <i className="bi bi-list-ul me-1"></i>PDF Lista
                        </button>
                    </div>
                </div>
            </ModuleHeader>

            {viewMode === "table" ? (
                <ProductTable
                    products={filteredProducts}
                    onView={(product) => setDetailProduct(product)}
                    onEdit={handlerProductSelected}
                    onDeactivate={handleDeactivate}
                    onActivate={handleActivate}
                    showInactive={showInactive}
                />
            ) : (
                <div className="row">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onView={() => setDetailProduct(product)}
                                onEdit={handlerProductSelected}
                                onDeactivate={handleDeactivate}
                                onActivate={handleActivate}
                            />
                        ))
                    ) : (
                        <p className="text-muted">No hay productos</p>
                    )}
                </div>
            )}

            <ProductModal
                isOpen={isModalOpen}
                onClose={handlerCloseModal}
                handlerAdd={handlerAddProduct}
                productSelected={productSelected}
            />

            {/* Modal de detalles del producto con galería de imágenes */}
            <ProductDetailModal
                product={detailProduct}
                isOpen={detailProduct !== null}
                onClose={() => setDetailProduct(null)}
            />

            {/* Contenedor oculto fuera de la pantalla donde se construye el HTML del reporte.
                html2pdf necesita un elemento DOM real para convertirlo a PDF.
                Lo posicionamos en -9999px para que no sea visible pero sí exista en el DOM.
                El ancho cambia dinámicamente: 700px para card (A4 portrait) y 1050px para lista (A4 landscape) */}
                <div style={{ position: "absolute", left: "-9999px", top: 0 }}>
                    <div ref={reportRef} style={{
                        width: reportMode === "list" ? "1050px" : "700px",
                        padding: "30px",
                        fontFamily: "Arial, sans-serif",
                        background: "#fff"
                    }}></div>
                </div>
        </>
    );
};
