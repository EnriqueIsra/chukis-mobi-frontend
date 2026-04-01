import { useEffect, useState } from "react";
import { findAll as findAllClients, create as createClient } from "../../../services/clientService";
import ClientSelector from "./ClientSelector";
import { AddressAutocomplete } from "../../common/AddressAutocomplete";
import { ClientModal } from "../../clients/ClientModal";
import Swal from "sweetalert2";

const emptyClient = { id: 0, nombre: "", telefono: "", direccion: "", email: "" };

const StepClient = ({ rentalData, setRentalData, onNext, onBack }) => {
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState(rentalData.clientId || "");
  const [address, setAddress] = useState(rentalData.address || "");
  const [error, setError] = useState("");
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const loadClients = () => {
    findAllClients().then((res) => {
      if (res?.data) setClients(res.data);
    });
  };

  useEffect(() => {
    loadClients();
  }, []);

  const selectedClient = clients.find((c) => c.id === Number(clientId));

  const handleUseClientAddress = () => {
    if (selectedClient?.direccion) {
      setAddress(selectedClient.direccion);
    }
  };

  const handleCreateClient = async (clientData) => {
    try {
      const res = await createClient(clientData);
      if (res?.data) {
        Swal.fire({
          toast: true, position: "top-end", icon: "success",
          title: "Cliente creado", showConfirmButton: false, timer: 2000
        });
        // Recargar lista y seleccionar el nuevo cliente
        await loadClients();
        setClientId(res.data.id);
      }
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "No se pudo crear el cliente" });
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
      clientName: selectedClient?.nombre || "",
      clientPhone: selectedClient?.telefono || "",
      address,
    });

    onNext();
  };

  return (
    <>
      <h5 className="mb-3">Paso 3 · Cliente y Dirección</h5>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="mb-3">
        <div className="d-flex justify-content-between align-items-center mb-1">
          <label className="form-label mb-0">Cliente</label>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => setIsClientModalOpen(true)}
          >
            <i className="bi bi-plus-lg me-1"></i>
            Nuevo cliente
          </button>
        </div>
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
        <AddressAutocomplete
          placeholder="Buscar dirección de entrega..."
          value={address}
          onChange={setAddress}
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

      {/* Modal de nuevo cliente */}
      <ClientModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        handlerAdd={handleCreateClient}
        clientSelected={emptyClient}
      />
    </>
  );
};

export default StepClient;
