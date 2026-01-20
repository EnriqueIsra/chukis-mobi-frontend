import { useEffect, useState } from "react";
import { createRental, updateRental } from "../../../services/rentalService";
import Swal from "sweetalert2";

const StepSummary = ({ rentalData, onBack, onFinish, isEditMode }) => {
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sum = rentalData.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    setTotal(sum);
  }, [rentalData.items]);

  const handleConfirm = async () => {
    setLoading(true);

    try {
      const requestData = {
        startDate: rentalData.startDate,
        endDate: rentalData.endDate,
        clientId: Number(rentalData.clientId),
        userId: Number(rentalData.userId),
        address: rentalData.address,
        items: rentalData.items.map(item => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity)
        }))
      };

      console.log(isEditMode ? "Actualizando renta:" : "Enviando renta:", requestData);

      if (isEditMode) {
        await updateRental(rentalData.id, requestData);
        Swal.fire({
          title: "Renta actualizada",
          text: "La renta se actualizó correctamente",
          icon: "success"
        });
      } else {
        await createRental(requestData);
        Swal.fire({
          title: "Renta creada",
          text: "La renta se registró correctamente",
          icon: "success"
        });
      }

      onFinish();
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: isEditMode ? "No se pudo actualizar la renta: " + error : "No se pudo registrar la renta: " + error,
        icon: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h5 className="mb-3">Paso 4 · Resumen de la Renta</h5>

      {/* Fechas */}
      <div className="card mb-3">
        <div className="card-body">
          <h6 className="fw-bold">Fechas</h6>
          <p className="mb-0">
            <strong>Inicio:</strong> {rentalData.startDate}<br />
            <strong>Fin:</strong> {rentalData.endDate}
          </p>
        </div>
      </div>

      {/* Cliente */}
      <div className="card mb-3">
        <div className="card-body">
          <h6 className="fw-bold">Cliente</h6>
          <p className="mb-0">
            ID Cliente: #{rentalData.clientId}<br />
            <strong>Dirección:</strong> {rentalData.address}
          </p>
        </div>
      </div>

      {/* Productos */}
      <div className="card mb-3">
        <div className="card-body">
          <h6 className="fw-bold">Productos</h6>

          <table className="table table-sm">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {rentalData.items.map(item => (
                <tr key={item.productId}>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>${item.price}</td>
                  <td>${item.price * item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="text-end fw-bold fs-5">
            Total: ${total}
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="d-flex justify-content-between mt-4">
        <button
          className="btn btn-outline-secondary"
          onClick={onBack}
          disabled={loading}
        >
          Atrás
        </button>

        <button
          className="btn btn-success"
          onClick={handleConfirm}
          disabled={loading}
        >
          {loading ? "Guardando..." : (isEditMode ? "Actualizar Renta" : "Confirmar Renta")}
        </button>
      </div>
    </>
  );
};

export default StepSummary;
