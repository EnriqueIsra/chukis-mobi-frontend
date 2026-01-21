import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { RentalsToolbar } from "../components/rentals/RentalToolBar";
import { RentalWizard } from "../components/rentals/wizard/RentalWizard";
import RentalTable from "../components/rentals/RentalTable";
import { RentalCard } from "../components/rentals/RentalCard";
import { findAll, remove, updateRentalStatus } from "../services/rentalService";

export const RentalsPage = () => {
  const [rentals, setRentals] = useState([]);
  const [viewMode, setViewMode] = useState("table");
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [rentalToEdit, setRentalToEdit] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const handlerViewRental = (rental) => {
    const itemsHtml = rental.items?.map(item =>
      `<tr><td>${item.productName}</td><td>${item.quantity}</td><td>$${item.unitPrice}</td><td>$${item.quantity * item.unitPrice}</td></tr>`
    ).join('') || '';

    Swal.fire({
      title: `Renta #${rental.id}`,
      html: `
        <div class="text-start">
          <p><strong>Cliente:</strong> ${rental.client?.name || 'N/A'}</p>
          <p><strong>Teléfono:</strong> ${rental.client?.phone || 'N/A'}</p>
          <p><strong>Fechas:</strong> ${rental.startDate} - ${rental.endDate}</p>
          <p><strong>Dirección:</strong> ${rental.address}</p>
          <p><strong>Creado por:</strong> ${rental.user?.username || 'N/A'}</p>
          <hr/>
          <table class="table table-sm">
            <thead><tr><th>Producto</th><th>Cant</th><th>Precio</th><th>Subtotal</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <p class="text-end fw-bold">Total: $${rental.total}</p>
        </div>
      `,
      width: 600,
      confirmButtonText: 'Cerrar'
    });
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
      title: 'Declarar esta renta como:',
      html: `
      <div class="d-flex flex-column gap-2">
        <button id="deliveredBtn" class="btn btn-warning">
          <i class="bi bi-truck me-1"></i> Entregada
        </button>
        <button id="pickedUpBtn" class="btn btn-success">
          <i class="bi bi-check-circle me-1"></i> Recogida
        </button>
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


  return (
    <>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Rentas</h2>
        <button
          className="btn btn-primary"
          onClick={handlerOpenWizard}
        >
          <i className="bi bi-plus-lg"></i> Nueva Renta
        </button>
      </div>

      {/* Toolbar (table / cards) */}
      <RentalsToolbar viewMode={viewMode} setViewMode={setViewMode} />

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
    </>
  );
};
