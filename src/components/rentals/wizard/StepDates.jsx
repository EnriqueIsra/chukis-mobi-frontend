import { useState } from "react";

const StepDates = ({ rentalData, setRentalData, onNext, onCancel }) => {
  // Extraer fecha y hora de los valores existentes (formato ISO: "2024-01-15T10:00")
  const extractDate = (dateTimeStr) => dateTimeStr ? dateTimeStr.split('T')[0] : '';
  const extractTime = (dateTimeStr) => dateTimeStr ? dateTimeStr.split('T')[1] || '' : '';

  const [startDate, setStartDate] = useState(extractDate(rentalData.startDate));
  const [startTime, setStartTime] = useState(extractTime(rentalData.startDate) || '10:00');
  const [endDate, setEndDate] = useState(extractDate(rentalData.endDate));
  const [endTime, setEndTime] = useState(extractTime(rentalData.endDate) || '18:00');
  const [error, setError] = useState("");

  const handleNext = () => {
    if (!startDate || !endDate) {
      setError("Debes seleccionar ambas fechas");
      return;
    }

    if (!startTime || !endTime) {
      setError("Debes seleccionar ambas horas");
      return;
    }

    // Combinar fecha y hora en formato ISO
    const startDateTime = `${startDate}T${startTime}`;
    const endDateTime = `${endDate}T${endTime}`;

    if (startDateTime > endDateTime) {
      setError("La fecha/hora de inicio no puede ser mayor a la fecha/hora fin");
      return;
    }

    setRentalData({
      ...rentalData,
      startDate: startDateTime,
      endDate: endDateTime,
    });

    onNext();
  };

  return (
    <>
      <h5 className="mb-3">Paso 1 · Fechas y horarios de la renta</h5>

      {error && (
        <div className="alert alert-danger py-2">{error}</div>
      )}

      <div className="row">
        {/* Fecha y hora de inicio */}
        <div className="col-md-6 mb-3">
          <label className="form-label">
            <i className="bi bi-calendar-event me-1"></i>
            Fecha de inicio
          </label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">
            <i className="bi bi-clock me-1"></i>
            Hora de inicio
          </label>
          <input
            type="time"
            className="form-control"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
          />
        </div>

        {/* Fecha y hora de fin */}
        <div className="col-md-6 mb-3">
          <label className="form-label">
            <i className="bi bi-calendar-check me-1"></i>
            Fecha de fin
          </label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="col-md-6 mb-3">
          <label className="form-label">
            <i className="bi bi-clock-history me-1"></i>
            Hora de fin
          </label>
          <input
            type="time"
            className="form-control"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
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
