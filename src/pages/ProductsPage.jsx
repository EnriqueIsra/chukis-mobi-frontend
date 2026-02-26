import { useState, useEffect } from "react";
import { ProductTable } from "../components/products/ProductTable";
import { ProductsToolbar } from "../components/products/ProductsToolbar";
import { ProductCard } from "../components/products/ProductCard";
import { ProductModal } from "../components/products/ProductModal";
import Swal from "sweetalert2";
import { findAll, create, update, remove } from "../services/productService";
import { ModuleHeader } from "../components/common/ModuleHeader";

export const ProductsPage = () => {

    const [products, setProducts] = useState([])

    // Guarda el texto que el usuario escribe en el buscador
    const [searchTerm, setSearchTerm] = useState("")
    const [productSelected, setProductSelected] = useState({
        id: 0,
        name: '',
        description: '',
        price: '',
        color: '',
        stock: '',
        imageUrl: ''
    })
    const [viewMode, setViewMode] = useState("cards");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getProducts = async () => {
        const result = await findAll()
        const data = result?.data;

        if (Array.isArray(data)) {
            setProducts(data);
        } else if (Array.isArray(data?.content)) {
            setProducts(data.content);
        } else {
            setProducts([]);
            console.error("Formato inesperado de productos:", data);
        }
    };


    useEffect(() => {
        getProducts()
    }, [])

    // Filtrado de productos (frontend) se filtra por: Nombre, Descripción, Precio y Color
    // Este arreglo será usado tanto por la tabla como por las cards
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
        console.log('handlerAddProduct received:', product);
        if (product.id > 0) {
            const response = await update(product)
            console.log('Update response:', response.data);
            setProducts(
                products.map(prod => {
                    if (prod.id == product.id) {
                        return { ...response.data };
                    }
                    return prod
                })
            )
            Swal.fire({
                title: "actualizado con éxito",
                text: `producto ${product.name} actualizado con éxito`,
                icon: "success"
            });
        } else {
            const response = await create(product);
            console.log('Create response:', response.data);
            setProducts([...products, { ...response.data }]);
            Swal.fire({
                title: "Creado con éxito",
                text: `Producto ${product.name} creado con éxito`,
                icon: "success"
            });
        }
    }

    const handlerProductSelected = (product) => {
        setProductSelected({ ...product })
        setIsModalOpen(true)
    }

    const handlerOpenModal = () => {
        setProductSelected({
            id: 0,
            name: '',
            description: '',
            price: '',
            color: '',
            stock: '',
            imageUrl: ''
        })
        setIsModalOpen(true)
    }

    const handlerCloseModal = () => {
        setIsModalOpen(false)
        setProductSelected({
            id: 0,
            name: '',
            description: '',
            price: '',
            color: '',
            stock: '',
            imageUrl: ''
        })
    }

    const handlerRemoveProduct = (id) => {

        Swal.fire({
            title: "¿Está seguro de eliminar el producto?",
            text: "Esta acción no se puede revertir",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "¡Continuar!",
            cancelButtonText: "Cancelar"
        }).then((result) => {
            if (result.isConfirmed) {
                remove(id)
                setProducts(
                    products.filter(product => product.id != id)
                )
                Swal.fire({
                    title: "¡Eliminado!",
                    text: "El producto ha sido eliminado con éxito",
                    icon: "success"
                });
            }
        });
    }

    return (
        <>
            {/* HEADER DEL MÓDULO */}
            {/* 
                products-header -> contenedor con fondo oscuro y efectos
                Adentro tiene 2 secciones:
                1.- El título + línea decorativa
                2.- Los controles en un row responsivo de Bootstrap
            */}
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
            </ModuleHeader>
            {/* ====== FIN HEADER ====== */}

            {viewMode === "table" ? (
                <div className="row">
                    <div className="col-12">
                        {products.length > 0 ? (
                            <ProductTable
                                products={filteredProducts}
                                handlerProductSelected={handlerProductSelected}
                                handlerRemoveProduct={handlerRemoveProduct}
                            />
                        ) : (
                            <div className="alert alert-warning">
                                No hay productos
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="row">
                    {products.length > 0 ? (
                        filteredProducts.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onEdit={handlerProductSelected}
                                onRemove={handlerRemoveProduct}
                            />
                        ))
                    ) : (
                        <div className="col-12">
                            <div className="alert alert-warning">
                                No hay productos
                            </div>
                        </div>
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
