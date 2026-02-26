import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { RentalsToolbar } from "../components/rentals/RentalToolBar";
import { RentalWizard } from "../components/rentals/wizard/RentalWizard";
import RentalTable from "../components/rentals/RentalTable";
import { RentalCard } from "../components/rentals/RentalCard";
import { findAll, remove, updateRentalStatus } from "../services/rentalService";
import PaymentModal from "../components/payments/PaymentModal"  // Importamos el componente PaymentModal
import RentalDetailModal from "../components/rentals/RentalDetailModal";
import { ModuleHeader } from "../components/common/ModuleHeader";

export const RentalsPage = () => {
  const [rentals, setRentals] = useState([]);
  const [viewMode, setViewMode] = useState("cards");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [rentalToEdit, setRentalToEdit] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estado para controlar el modal de pagos. 
  // paymentRental guarda la renta seleccionada para pagos, 
  // - si es null: el modal está cerrado, 
  // - si tiene una renta: el modal está abierto mostrando esa renta. 
  // Usamos la renta completa no solo el id porque el modal necesita mostrar informacion como el total de la renta
  const [paymentRental, setPaymentRental] = useState(null);

  // Renta seleccionada para el modal de detalles
  // null = modal cerrado, objeto = modal abierto
  const [selectedRental, setSelectedRental] = useState(null)

  // Obtener el usuario logueado del localStorage
  const loggedUser = JSON.parse(localStorage.getItem("user"));
  const userId = loggedUser?.id;

  const getRentals = async () => {
    setLoading(true);
    const result = await findAll();
    if (result && result.data) {
      setRentals(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getRentals();
  }, []);

  const handlerOpenWizard = () => {
    setRentalToEdit(null);
    setIsWizardOpen(true);
  };

  const handlerCloseWizard = () => {
    setIsWizardOpen(false);
    setRentalToEdit(null);
  };

  const handlerSuccess = () => {
    getRentals();
  };

  const handlerEditRental = (rental) => {
    setRentalToEdit(rental);
    setIsWizardOpen(true);
  };

  // Ver detalles de una renta -> abre el RentalDetailModal
  const handlerViewRental = (rental) => {
    setSelectedRental(rental)
  };

  const handlerDeleteRental = async (id) => {
    const result = await Swal.fire({
      title: '¿Eliminar renta?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    });

    if (result.isConfirmed) {
      try {
        await remove(id);
        Swal.fire('Eliminada', 'La renta ha sido eliminada', 'success');
        getRentals();
      } catch (error) {
        Swal.fire('Error', 'No se pudo eliminar la renta', 'error');
      }
    }
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
        document
          .getElementById('deliveredBtn')
          ?.addEventListener('click', async () => {
            await changeStatus(rental.id, 'DELIVERED');
          });

        document
          .getElementById('pickedUpBtn')
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
      getRentals(); // refresca lista
    } catch (error) {
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

  // Handler para ABRIR el modal de pagos
  // Recibe el objeto rental completo desde RentalCard o RentalTable
  // Al hacer serPaymentRental(rental), React re-renderiza y el modal se muestra porque paymentRental ya no es null
  const handlerOpenPayment = (rental) => {
    setPaymentRental(rental)
  }

  // Handler para cerrar el modal de pagos
  // Al hacer setPaymentRental(null), react re-renderiza y 
  // el modal se oculta porque la condición {paymentRental && ...}
  // es falsa cuando paymentRental es null
  const handlerClosePayment = () => {
    setPaymentRental(null)
  }

  // Callback cuando se crea un pago exitosamente
  // Este callback se ejecuta desde PaymentModal después de registrar un pago. 
  // Llamamos a getRentals() para recargar la lista de rentas y que se actualicen 
  // los totales en las tarjetas/tabla si en el futuro mostramos el saldo
  const handlerPaymentCreated = () => {
    getRentals()
  }

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
          />
        </div>

        <div className="col-12 col-lg-auto">
          <RentalsToolbar viewMode={viewMode} setViewMode={setViewMode} />
        </div>
      </ModuleHeader>

      {/* Loading */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : viewMode === "table" ? (
        <RentalTable
          rentals={rentals}
          onView={handlerViewRental}
          onEdit={handlerEditRental}
          onDelete={handlerDeleteRental}
          onChangeStatus={handlerChangeStatus}
          onCancel={handlerCancelRental}
          // Pasamos el handler de los pagos a RentalTable
          // Cuando el usuario haga clic en el botón de pagos
          // en la tabla, se ejecutará handlerOpenPayment
          onPayment={handlerOpenPayment}
        />
      ) : (
        <div className="row">
          {rentals.length === 0 ? (
            <div className="col-12 text-center text-muted py-4">
              No hay rentas registradas
            </div>
          ) : (
            rentals.map((rental) => (
              <RentalCard
                key={rental.id}
                rental={rental}
                onView={handlerViewRental}
                onEdit={handlerEditRental}
                onDelete={handlerDeleteRental}
                onChangeStatus={handlerChangeStatus}
                onCancel={handlerCancelRental}
                // Pasamos el handler de pagos a RentalCard
                // Igual que con RentalTable, cuando el usuario
                // haga clic en el botón de pagos en la tarjeta,
                // se ejecutará handlerOpenPayment
                onPayment={handlerOpenPayment}
              />
            ))
          )}
        </div>
      )}

      {/* Wizard */}
      {isWizardOpen && (
        <RentalWizard
          onClose={handlerCloseWizard}
          onSuccess={handlerSuccess}
          userId={userId}
          rentalToEdit={rentalToEdit}
        />
      )}

      {/* Renderizado condicional del PaymentModal
      {paymentRental && ...} significa:
      - Si paymentRental tiene valor (no es null) -> renderiza el modal
      - Si paymentRental es null -> no renderiza nada
      Props que le pasamos
      - rental: La renta seleccionada (para mostrar su info y total)
      - onClose: Función para cerrar el modal
      - onPaymentCreated: Callback para recargar datos después de un pago */}
      {paymentRental && (
        <PaymentModal
          rental={paymentRental}
          onClose={handlerClosePayment}
          onPaymentCreated={handlerPaymentCreated}
        />
      )}

      {/* Modal de detalles de renta */}
      {selectedRental && (
        <RentalDetailModal
          rental={selectedRental}
          onClose={() => setSelectedRental(null)}
          onEdit={handlerEditRental}
          onChangeStatus={handlerChangeStatus}
          onCancel={handlerCancelRental}
          onDelete={handlerDeleteRental}
          onPayment={handlerOpenPayment}
        />
      )}
    </>
  );
};
