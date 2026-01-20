import { useState } from "react";

const StepDates = ({ rentalData, setRentalData, onNext, onCancel }) => {
  const [startDate, setStartDate] = useState(rentalData.startDate);
  const [endDate, setEndDate] = useState(rentalData.endDate);
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!startDate || !endDate) {
      setError("Debes seleccionar ambas fechas");
      return;
    }

    if (startDate > endDate) {
      setError("La fecha de inicio no puede ser mayor a la fecha fin");
      return;
    }

    setRentalData({
      ...rentalData,
      startDate,
      endDate,
    });

    onNext();
  };

  return (
    <>
      <h5 className="mb-3">Paso 1 · Fechas de la renta</h5>

      {error && (
        <div className="alert alert-danger py-2">{error}</div>
      )}

      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Fecha inicio</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">Fecha fin</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      <div className="d-flex justify-content-between mt-4">
        <button className="btn btn-outline-secondary" onClick={onCancel}>
          Cancelar
        </button>

        <button className="btn btn-primary" onClick={handleNext}>
          Siguiente
        </button>
      </div>
    </>
  );
};

export default StepDates;
