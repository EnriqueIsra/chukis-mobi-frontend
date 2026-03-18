import { useEffect, useState } from "react";
import { createRental, updateRental } from "../../../services/rentalService";
import Swal from "sweetalert2";

const StepSummary = ({ rentalData, onBack, onFinish, isEditMode }) => {
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isEditingTotal, setIsEditingTotal] = useState(false)
  const [customTotal, setCustomTotal] = useState(null)  // null = usa el total calculado

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
        total: customTotal ?? total,
        items: rentalData.items.map(item => ({
          productId: Number(item.productId),
          quantity: Number(item.quantity)
        }))
      };

      console.log(isEditMode ? "Actualizando renta:" : "Enviando renta:", requestData);

      // Agrega esto justo antes del if (isEditMode)
      console.log("Total enviado:", requestData.total)
      console.log("customTotal:", customTotal)
      console.log("total calculado:", total)

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

          <div className="text-end fw-bold fs-5 d-flex justify-content-end align-items-center gap-2">
            <span>Total:</span>

            {isEditingTotal ? (
              // Modo edición - input numérico
              <div className="d-flex align-items-center gap-2">
                <span>$</span>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  style={{ width: "120px" }}
                  value={customTotal ?? total}
                  min={0}
                  onChange={(e) => setCustomTotal(Number(e.target.value))}
                  autoFocus
                />
                {/* Confirmar el valor editado */}
                <button
                  className="btn btn-success btn-sm"
                  onClick={() => setIsEditingTotal(false)}
                >
                  <i className="bi bi-check-lg" />
                </button>
                {/* Cancelar y volver al total calculado */}
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setCustomTotal(null)
                    setIsEditingTotal(false)
                  }}
                >
                  <i className="bi bi-x-lg" />
                </button>
              </div>
            ) : (
              // Modo lectura - muestra el total con el botón de editar 
              <div className="d-flex align-items-center gap-2">
                <span className={customTotal !== null ? "text-warning" : ""}>
                  ${customTotal ?? total}
                </span>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  title="Modificar total"
                  onClick={() => setIsEditingTotal(true)}
                >
                  <i className="bi bi-pencil" />
                </button>
                {/* Botón para restablecer al total calculado si fue modificado */}
                {customTotal !== null && (
                  <button
                    className="btn btn-sm btn-outline-danger"
                    title="Restablecer total original"
                    onClick={() => setCustomTotal(null)}
                  >
                    <i className="bi bi-arrow-counterclockwise" />
                  </button>
                )}
              </div>
            )}
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
