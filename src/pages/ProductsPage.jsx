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
            </ModuleHeader>

            {viewMode === "table" ? (
                <ProductTable
                    products={filteredProducts}
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
        </>
    );
};
