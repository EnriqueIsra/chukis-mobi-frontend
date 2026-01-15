import { useState, useEffect } from "react";
import { ProductTable } from "../components/products/ProductTable";
import { ProductsToolbar } from "../components/products/ProductsToolbar";
import { ProductCard } from "../components/products/ProductCard";
import { ProductModal } from "../components/products/ProductModal";
import Swal from "sweetalert2";
import { findAll, create, update, remove } from "../services/productService";

export const ProductsPage = () => {

    const [products, setProducts] = useState([])
    const [productSelected, setProductSelected] = useState({
        id: 0,
        name: '',
        description: '',
        price: '',
        color: '',
        stock: '',
        imageUrl: ''
    })
    const [viewMode, setViewMode] = useState("table");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const getProducts = async () => {
        const result = await findAll()
        setProducts(result.data)
    }

    useEffect(() => {
        getProducts()
    }, [])
    
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
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h2 className="mb-0">Productos</h2>
                <button
                    className="btn btn-primary"
                    onClick={handlerOpenModal}
                >
                    <i className="bi bi-plus-lg"></i> Agregar Producto
                </button>
            </div>

            <ProductsToolbar viewMode={viewMode} setViewMode={setViewMode} />

            {viewMode === "table" ? (
                <div className="row">
                    <div className="col-12">
                        {products.length > 0 ? (
                            <ProductTable
                                products={products}
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
                        products.map(product => (
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
