import { useState, useEffect } from "react";
import { ProductForm } from "../components/products/ProductForm";
import { ProductTable } from "../components/products/ProductTable";
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
        stock: ''
    })

    const getProducts = async () => {
        const result = await findAll()
        setProducts(result.data)
    }

    useEffect(() => {
        getProducts()
    }, [])
    
    const handlerAddProduct = async (product) => {
        if (product.id > 0) {
            const response = await update(product)
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
        console.log(productSelected)
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
            <h2>Productos</h2>

            <div className="row">
                <div className="col-md-4">
                    <ProductForm
                        handlerAdd={handlerAddProduct}
                        productSelected={productSelected}
                    />
                </div>

                <div className="col-md-8">
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
        </>
    );
};
