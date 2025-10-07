import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { ProductTable } from "./components/ProductTable";
import { ProductForm } from "./components/ProductForm";
import { create, findAll, remove, update } from "./services/productService";
import Swal from "sweetalert2";

// const initProducts = [
//   {
//     id: 1,
//     name: "Monitor Asus 37 pulgadas",
//     description: "El monitor es perfecto para juegos",
//     price: 1000,
//   },
//   {
//     id: 2,
//     name: "Iphone 16 pro",
//     description: "El telefono es excelente e incluye Apple Intelligence",
//     price: 1600,
//   },
// ];

export const ProductsApp = ({ title = "title default" }) => {

  const [products, setProducts] = useState([])

  const [productSelected, setProductSelected] = useState({
    id: 0,
    name: '',
    description: '',
    price: ''
  })

  const getProducts = async () => {
    const result = await findAll()
    setProducts(result.data)

  }

  useEffect(() => {
    getProducts()
    console.log('cargando la página...')
  }, [])

  const handlerAddProcuct = async (product) => {
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
    <div className="container my-4">
      <h2>{title}</h2>
      <div className="row">
        <div className="col">
          <ProductForm handlerAdd={handlerAddProcuct} productSelected={productSelected} />
        </div>
        <div className="col">
          {
            (products.length > 0) ?
              <ProductTable products={products}
                handlerProductSelected={handlerProductSelected}
                handlerRemoveProduct={handlerRemoveProduct} />
              : <div className="alert alert-warning">
                No hay productos en el sistema
              </div>
          }

        </div>
      </div>
    </div>
  );
};

ProductsApp.propTypes = {
  title: PropTypes.string.isRequired,
};
