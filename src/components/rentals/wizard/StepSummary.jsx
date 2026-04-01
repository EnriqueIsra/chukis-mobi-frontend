import { useEffect, useState } from "react";
import { createRental, updateRental } from "../../../services/rentalService";
import Swal from "sweetalert2";

const formatDateLong = (dateTimeStr) => {
  if (!dateTimeStr) return "N/A";
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

const StepSummary = ({ rentalData, onBack, onFinish, isEditMode }) => {
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [isEditingTotal, setIsEditingTotal] = useState(false)
  const [customTotal, setCustomTotal] = useState(null)  // null = usa el total calculado

  useEffect(() => {
    const sum = rentalData.items.reduce(
      (acc, item) => acc + item.price * (item.quantity + (item.subcontractedQuantity || 0)),
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
          quantity: Number(item.quantity),
          subcontractedQuantity: Number(item.subcontractedQuantity || 0)
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
        <div className="card-header bg-primary bg-opacity-10">
          <h6 className="fw-bold mb-0">
            <i className="bi bi-calendar-range me-2 text-primary"></i>Fechas
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <strong>Inicio:</strong>
              <div className="text-capitalize">{formatDateLong(rentalData.startDate)}</div>
            </div>
            <div className="col-md-6">
              <strong>Fin:</strong>
              <div className="text-capitalize">{formatDateLong(rentalData.endDate)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Cliente */}
      <div className="card mb-3">
        <div className="card-header bg-success bg-opacity-10">
          <h6 className="fw-bold mb-0">
            <i className="bi bi-person me-2 text-success"></i>Cliente
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6 mb-2">
              <strong>ID Cliente:</strong> #{rentalData.clientId}
            </div>
            <div className="col-md-6 mb-2">
              <strong>Nombre:</strong> {rentalData.clientName || "—"}
            </div>
            <div className="col-md-6 mb-2">
              <strong>Teléfono:</strong> {rentalData.clientPhone || "—"}
            </div>
            <div className="col-md-6 mb-2">
              <strong>Dirección:</strong> {rentalData.address}
            </div>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="card mb-3">
        <div className="card-header bg-warning bg-opacity-10">
          <h6 className="fw-bold mb-0">
            <i className="bi bi-box-seam me-2 text-warning"></i>Productos
          </h6>
        </div>
        <div className="card-body">

          <table className="table table-sm">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                {rentalData.items.some(i => i.subcontractedQuantity > 0) && (
                  <th>Subcontratadas</th>
                )}
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {rentalData.items.map(item => (
                <tr key={item.productId}>
                  <td>
                    {item.name}
                    {item.subcontractedQuantity > 0 && (
                      <span className="badge bg-warning text-dark ms-2">
                        <i className="bi bi-truck me-1"></i>Subcontrato
                      </span>
                    )}
                  </td>
                  <td>{item.quantity + (item.subcontractedQuantity || 0)}</td>
                  {rentalData.items.some(i => i.subcontractedQuantity > 0) && (
                    <td>
                      {item.subcontractedQuantity > 0 ? (
                        <span>{item.quantity} propias + {item.subcontractedQuantity} ext.</span>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                  )}
                  <td>${item.price}</td>
                  <td>${item.price * (item.quantity + (item.subcontractedQuantity || 0))}</td>
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
