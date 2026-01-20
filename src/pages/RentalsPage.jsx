import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { RentalsToolbar } from "../components/rentals/RentalToolBar";
import { RentalWizard } from "../components/rentals/wizard/RentalWizard";
import RentalTable from "../components/rentals/RentalTable";
import { RentalCard } from "../components/rentals/RentalCard";
import { findAll, remove } from "../services/rentalService";

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
