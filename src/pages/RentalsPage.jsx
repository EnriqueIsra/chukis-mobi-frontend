import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { RentalsToolbar } from "../components/rentals/RentalToolBar";
import { RentalWizard } from "../components/rentals/wizard/RentalWizard";
import RentalTable from "../components/rentals/RentalTable";
import { RentalCard } from "../components/rentals/RentalCard";
import { findAll, findInactive, deactivate, activate, updateRentalStatus } from "../services/rentalService";
import PaymentModal from "../components/payments/PaymentModal";
import RentalDetailModal from "../components/rentals/RentalDetailModal";
import { ModuleHeader } from "../components/common/ModuleHeader";

export const RentalsPage = () => {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const userId = currentUser?.id;

  const [rentals, setRentals] = useState([]);
  const [viewMode, setViewMode] = useState("cards");
  const [showInactive, setShowInactive] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [rentalToEdit, setRentalToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentRental, setPaymentRental] = useState(null);
  const [selectedRental, setSelectedRental] = useState(null);

  const getRentals = async () => {
    setLoading(true);
    const result = showInactive ? await findInactive() : await findAll();
    if (result && result.data) {
      setRentals(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getRentals();
  }, [showInactive]);

  const filteredRentals = Array.isArray(rentals) ? rentals.filter(rental => {
    const search = searchTerm.toLowerCase();
    const matchAddress = rental.address?.toLowerCase().includes(search);
    const matchStatus = rental.status?.toLowerCase().includes(search);
    const matchTotal = rental.total?.toString().includes(search);
    const matchClientName = rental.client?.name?.toLowerCase().includes(search);
    const matchClientPhone = rental.client?.phone?.includes(search);
    const matchUsername = rental.user?.username?.toLowerCase().includes(search);
    const matchItems = rental.items?.some(item =>
      item.productName?.toLowerCase().includes(search) ||
      item.quantity?.toString().includes(search) ||
      item.unitPrice?.toString().includes(search)
    );
    return matchAddress || matchStatus || matchTotal || matchClientName || matchClientPhone || matchUsername || matchItems;
  }) : [];

  const handlerOpenWizard = () => {
    setRentalToEdit(null);
    setIsWizardOpen(true);
  };

  const handlerCloseWizard = () => {
    setIsWizardOpen(false);
    setRentalToEdit(null);
  };

  const handlerSuccess = () => getRentals();

  const handlerEditRental = (rental) => {
    setRentalToEdit(rental);
    setIsWizardOpen(true);
  };

  const handlerViewRental = (rental) => setSelectedRental(rental);

  const handleDeactivate = async (id, reason) => {
    await deactivate(id, reason, currentUser.id);
    getRentals();
  };

  const handleActivate = async (id) => {
    await activate(id);
    getRentals();
  };

  const handlerChangeStatus = (rental) => {
    Swal.fire({
      title: 'Cambiar status de la renta',
      html: `
      <div class="d-flex flex-column gap-2">
        ${rental.status === 'CREATED' ? `
          <button id="deliveredBtn" class="btn btn-warning">
            <i class="bi bi-truck me-1"></i> Marcar como Entregada
          </button>
        ` : ''}
        ${rental.status === 'DELIVERED' ? `
          <button id="pickedUpBtn" class="btn btn-success">
            <i class="bi bi-check-circle me-1"></i> Marcar como Recogida
          </button>
        ` : ''}
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Cerrar',
      didOpen: () => {
        document.getElementById('deliveredBtn')
          ?.addEventListener('click', async () => {
            await changeStatus(rental.id, 'DELIVERED');
          });
        document.getElementById('pickedUpBtn')
          ?.addEventListener('click', async () => {
            await changeStatus(rental.id, 'PICKED_UP');
          });
      }
    });
  };

  const changeStatus = async (id, status) => {
    try {
      await updateRentalStatus(id, status);
      Swal.fire('Actualizado', 'El estado fue actualizado correctamente', 'success');
      getRentals();
    } catch (error) {
      console.error(error);
      Swal.fire('Error', 'No se pudo cambiar el estado', 'error');
    }
  };

  const handlerCancelRental = async (rental) => {
    const result = await Swal.fire({
      title: '¿Cancelar renta?',
      text: 'La renta será marcada como cancelada',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc3545',
      confirmButtonText: 'Sí, cancelar',
      cancelButtonText: 'Volver'
    });
    if (result.isConfirmed) {
      try {
        await updateRentalStatus(rental.id, 'CANCELLED');
        Swal.fire('Cancelada', 'La renta fue cancelada', 'success');
        getRentals();
      } catch {
        Swal.fire('Error', 'No se pudo cancelar la renta', 'error');
      }
    }
  };

  const handlerOpenPayment = (rental) => setPaymentRental(rental);
  const handlerClosePayment = () => setPaymentRental(null);
  const handlerPaymentCreated = () => getRentals();

  return (
    <>
      <ModuleHeader title="Rentas">
        <div className="col-12 col-lg-auto">
          <button className="btn btn-primary w-100" onClick={handlerOpenWizard}>
            <i className="bi bi-plus-lg"></i> Agregar Nueva Renta
          </button>
        </div>

        <div className="col-12 col-lg">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar por cliente, fecha, dirección o estado..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="col-12 col-lg-auto">
          <RentalsToolbar viewMode={viewMode} setViewMode={setViewMode} />
        </div>

        <div className="col-12 col-lg-auto">
          <div className="btn-group">
            <button
              className={`btn btn-outline-secondary ${!showInactive ? "active" : ""}`}
              onClick={() => setShowInactive(false)}
            >
              <i className="bi bi-eye me-1"></i>Activos
            </button>
            <button
              className={`btn btn-outline-secondary ${showInactive ? "active" : ""}`}
              onClick={() => setShowInactive(true)}
            >
              <i className="bi bi-eye-slash me-1"></i>Inactivos
            </button>
          </div>
        </div>
      </ModuleHeader>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : viewMode === "table" ? (
        <RentalTable
          rentals={filteredRentals}
          onView={handlerViewRental}
          onEdit={handlerEditRental}
          onDeactivate={handleDeactivate}
          onActivate={handleActivate}
          onChangeStatus={handlerChangeStatus}
          onCancel={handlerCancelRental}
          onPayment={handlerOpenPayment}
          showInactive={showInactive}
        />
      ) : (
        <div className="row">
          {filteredRentals.length === 0 ? (
            <p className="text-muted">No hay rentas registradas</p>
          ) : (
            filteredRentals.map((rental) => (
              <RentalCard
                key={rental.id}
                rental={rental}
                onView={handlerViewRental}
                onEdit={handlerEditRental}
                onDeactivate={handleDeactivate}
                onActivate={handleActivate}
                onChangeStatus={handlerChangeStatus}
                onCancel={handlerCancelRental}
                onPayment={handlerOpenPayment}
              />
            ))
          )}
        </div>
      )}

      {isWizardOpen && (
        <RentalWizard
          onClose={handlerCloseWizard}
          onSuccess={handlerSuccess}
          userId={userId}
          rentalToEdit={rentalToEdit}
        />
      )}

      {paymentRental && (
        <PaymentModal
          rental={paymentRental}
          onClose={handlerClosePayment}
          onPaymentCreated={handlerPaymentCreated}
        />
      )}

      {selectedRental && (
        <RentalDetailModal
          rental={selectedRental}
          onClose={() => setSelectedRental(null)}
          onEdit={handlerEditRental}
          onChangeStatus={handlerChangeStatus}
          onCancel={handlerCancelRental}
          onDeactivate={handleDeactivate}
          onPayment={handlerOpenPayment}
        />
      )}
    </>
  );
};
