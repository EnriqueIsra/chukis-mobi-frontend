import { useEffect, useState } from "react";
import { findAll as findAllClients } from "../../../services/clientService";
import ClientSelector from "./ClientSelector";

const StepClient = ({ rentalData, setRentalData, onNext, onBack }) => {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState(rentalData.clientId || "");
  const [address, setAddress] = useState(rentalData.address || "");
  const [error, setError] = useState("");

  useEffect(() => {
    findAllClients().then((res) => {
      setClients(res.data);
    });
  }, []);

  const selectedClient = clients.find((c) => c.id === Number(clientId));

  const handleUseClientAddress = () => {
    if (selectedClient?.direccion) {
      setAddress(selectedClient.direccion);
    }
  };

  const handleNext = () => {
    if (!clientId) {
      setError("Selecciona un cliente");
      return;
    }

    if (!address.trim()) {
      setError("La dirección del evento es obligatoria");
      return;
    }

    setRentalData({
      ...rentalData,
      clientId,
      address,
    });

    onNext();
  };

  return (
    <>
      <h5 className="mb-3">Paso 3 · Cliente y Dirección</h5>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="mb-3">
        <label className="form-label">Cliente</label>
        <ClientSelector
          clients={clients}
          value={clientId}
          onChange={setClientId}
        />
      </div>

      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <label className="form-label mb-0">Dirección del evento</label>
          {selectedClient?.direccion && (
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary"
              onClick={handleUseClientAddress}
              title="Usar dirección del cliente"
            >
              <i className="bi bi-geo-alt me-1"></i>
              Usar dirección del cliente
            </button>
          )}
        </div>
        <textarea
          className="form-control"
          rows="3"
          placeholder="Dirección completa del evento"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

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

export default StepClient;
