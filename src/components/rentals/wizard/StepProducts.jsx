import { useEffect, useState } from "react";
import { getAvailability } from "../../../services/productService";
import ProductSelectorRow from "./ProductSelectRow";

const StepProducts = ({ rentalData, setRentalData, onNext, onBack }) => {
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState(rentalData.items || []);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (rentalData.startDate && rentalData.endDate) {
      setLoading(true);
      getAvailability(rentalData.startDate, rentalData.endDate)
        .then((res) => {
          if (res && res.data) {
            setProducts(res.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [rentalData.startDate, rentalData.endDate]);

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

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-2 text-muted">Verificando disponibilidad...</p>
        </div>
      ) : (
        <table className="table table-sm align-middle">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Precio</th>
              <th>Disponible</th>
              <th width="100">Cantidad</th>
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
      )}

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
