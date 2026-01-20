import { useEffect, useState } from "react";
import { findAll as findAllProducts } from "../../../services/productService";
import ProductSelectorRow from "./ProductSelectRow";

const StepProducts = ({ rentalData, setRentalData, onNext, onBack }) => {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState(rentalData.items || []);
  const [error, setError] = useState("");

  useEffect(() => {
    findAllProducts().then((res) => {
      setProducts(res.data);
    });
  }, []);

  const addOrUpdateItem = (product, quantity) => {
    if (quantity <= 0) {
      setItems(items.filter((i) => i.productId !== product.id));
      return;
    }

    const existing = items.find((i) => i.productId === product.id);

    if (existing) {
      setItems(
        items.map((i) =>
          i.productId === product.id ? { ...i, quantity } : i
        )
      );
    } else {
      setItems([
        ...items,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
        },
      ]);
    }
  };

  const handleNext = () => {
    if (items.length === 0) {
      setError("Debes agregar al menos un producto");
      return;
    }

    setRentalData({
      ...rentalData,
      items,
    });

    onNext();
  };

  return (
    <>
      <h5 className="mb-3">Paso 2 · Productos</h5>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <table className="table table-sm align-middle">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th width="120">Cantidad</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductSelectorRow
              key={product.id}
              product={product}
              selectedItem={items.find(
                (i) => i.productId === product.id
              )}
              onChange={addOrUpdateItem}
            />
          ))}
        </tbody>
      </table>

      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-outline-secondary" onClick={onBack}>
          Atrás
        </button>

        <button className="btn btn-primary" onClick={handleNext}>
          Siguiente
        </button>
      </div>
    </>
  );
};

export default StepProducts;
