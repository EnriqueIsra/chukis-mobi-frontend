import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { findAll, findById, deactivate, updateRentalStatus } from "../services/rentalService";
import { RentalWizard } from "../components/rentals/wizard/RentalWizard";
import "./CalendarPage.css";
import "../components/dashboard/deliverySection.css";
import RentalDetailModal from "../components/rentals/RentalDetailModal";
import PaymentModal from "../components/payments/PaymentModal";
import { ModuleHeader } from "../components/common/ModuleHeader";

// Colores según status
const statusColors = {
  CREATED: { bg: "#0dcaf0", border: "#0aa2c0", text: "#000", glow: "#0dcaf0" },      // info/azul
  DELIVERED: { bg: "#ffc107", border: "#d39e00", text: "#000", glow: "#ffe066" },    // warning/amarillo (glow más suave)
  PICKED_UP: { bg: "#198754", border: "#146c43", text: "#fff", glow: "#00ff88" },    // success/verde (glow más brillante)
  CANCELLED: { bg: "#dc3545", border: "#b02a37", text: "#fff", glow: "#ff4d6a" }     // danger/rojo (glow más brillante)
};

const statusLabels = {
  CREATED: "Creada",
  DELIVERED: "Entregada",
  PICKED_UP: "Recogida",
  CANCELLED: "Cancelada"
};

// Formatear fecha y hora
const formatDateTime = (dateTimeStr) => {
  if (!dateTimeStr) return "N/A";
  const date = new Date(dateTimeStr);
  return date.toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

export const CalendarPage = () => {
  const [rentals, setRentals] = useState([]);
  const [events, setEvents] = useState([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [rentalToEdit, setRentalToEdit] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(true);
  const calendarRef = useRef(null);

  // Renta seleccionada para el modal de detalles
  const [selectedRental, setSelectedRental] = useState(null)
  // Renta seleccionada para el modal de pagos
  const [paymentRental, setPaymentRental] = useState(null)

  // Estado para dropdown de status y buscador
  const [activeStatusDropdown, setActiveStatusDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const statusDropdownRef = useRef(null);

  const loggedUser = JSON.parse(localStorage.getItem("user"));
  const userId = loggedUser?.id;

  const getRentals = async () => {
    setLoading(true);
    const result = await findAll();
    if (result && result.data) {
      setRentals(result.data);
      // Convertir rentas a eventos de FullCalendar
      const calendarEvents = result.data.map((rental) => {
        const colors = statusColors[rental.status] || statusColors.CREATED;
        return {
          id: rental.id.toString(),
          title: `#${rental.id} - ${rental.client?.name || "Sin cliente"}`,
          start: rental.startDate,
          end: rental.endDate,
          backgroundColor: colors.bg,
          borderColor: colors.border,
          textColor: colors.text,
          extendedProps: {
            rental: rental
          }
        };
      });
      setEvents(calendarEvents);
    }
    setLoading(false);
  };

  useEffect(() => {
    getRentals();
  }, []);

  const searchDropdownRef = useRef(null);

  // Cerrar dropdowns al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (statusDropdownRef.current && !statusDropdownRef.current.contains(e.target)) {
        setActiveStatusDropdown(null);
      }
      if (searchRef.current && !searchRef.current.contains(e.target) &&
          searchDropdownRef.current && !searchDropdownRef.current.contains(e.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Rentas filtradas por status para el dropdown
  const getRentalsByStatus = (status) => {
    return rentals.filter(r => r.status === status);
  };

  // Rentas filtradas por búsqueda
  const getSearchResults = () => {
    if (!searchTerm.trim()) return [];
    const search = searchTerm.toLowerCase();
    return rentals.filter(r => {
      const idMatch = String(r.id).includes(search);
      const clientMatch = r.client?.name?.toLowerCase().includes(search);
      const phoneMatch = r.client?.phone?.toLowerCase().includes(search);
      const addressMatch = r.address?.toLowerCase().includes(search);
      const itemsMatch = r.items?.some(item =>
        item.productName?.toLowerCase().includes(search)
      );
      return idMatch || clientMatch || phoneMatch || addressMatch || itemsMatch;
    });
  };

  // Formatear moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency', currency: 'MXN',
      minimumFractionDigits: 0, maximumFractionDigits: 0
    }).format(value || 0);
  };

  // Formatear fecha larga
  const formatDateLong = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString('es-MX', {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  // Calcular total pagado de una renta
  const getTotalPaid = (rental) => {
    return rental.payments?.reduce((sum, p) => sum + p.amount, 0) || 0;
  };

  // Abrir renta desde dropdown (busca la renta completa con findById)
  const handleRentalClick = async (rentalId) => {
    try {
      const response = await findById(rentalId);
      if (response?.data) {
        setSelectedRental(response.data);
        setActiveStatusDropdown(null);
        setSearchOpen(false);
      }
    } catch (error) {
      Swal.fire('Error', 'No se pudieron cargar los detalles de la renta', 'error');
    }
  };

  // Renderizar un item de renta en el dropdown (mismo formato que dashboard)
  const renderRentalItem = (rental) => {
    const totalPaid = getTotalPaid(rental);
    const pending = (rental.total || 0) - totalPaid;
    const productSummary = rental.items?.map(item =>
      `${item.quantity} ${item.productName}`
    ).join(', ') || 'Sin productos';

    return (
      <div
        key={rental.id}
        className="delivery-item"
        style={{ cursor: 'pointer' }}
        onClick={() => handleRentalClick(rental.id)}
      >
        <div className="d-flex justify-content-between align-items-start mb-1">
          <div>
            <span className="fw-semibold">
              <i className="bi bi-person-fill text-primary me-1"></i>
              {rental.client?.name || 'Sin cliente'}
            </span>
            <small className="text-muted ms-2">
              <i className="bi bi-telephone me-1"></i>
              {rental.client?.phone || 'N/A'}
            </small>
          </div>
          <span className="badge bg-secondary">#{rental.id}</span>
        </div>
        <div className="mb-1">
          <small className="text-capitalize">
            <i className="bi bi-calendar-event me-1 text-primary"></i>
            <strong>Entrega:</strong> {formatDateLong(rental.startDate)}
          </small>
        </div>
        <div className="mb-1">
          <small className="text-muted">
            <i className="bi bi-geo-alt me-1"></i>
            {rental.address}
          </small>
        </div>
        <div className="mb-2">
          <small className="text-secondary">
            <i className="bi bi-box-seam me-1"></i>
            {productSummary}
          </small>
        </div>
        <div className="delivery-payment">
          <div className="d-flex justify-content-between mb-1">
            <small>Total: <strong>{formatCurrency(rental.total)}</strong></small>
            <small>Pagado: <strong className="text-success">{formatCurrency(totalPaid)}</strong></small>
            <small>Pendiente: <strong className="text-danger">{formatCurrency(pending)}</strong></small>
          </div>
        </div>
      </div>
    );
  };

  // Click en un evento
  const handleEventClick = (clickInfo) => {
    const rental = clickInfo.event.extendedProps.rental;
    setSelectedRental(rental);
  };

  // Click en espacio vacío (crear nueva renta)
  const handleDateClick = (info) => {
    const clickedDate = info.dateStr;

    Swal.fire({
      title: "Crear nueva renta",
      text: `¿Deseas crear una nueva renta para ${formatDateOnly(clickedDate)}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0d6efd",
      confirmButtonText: "Sí, crear renta",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedDate(clickedDate);
        setRentalToEdit(null);
        setIsWizardOpen(true);
      }
    });
  };

  // Seleccionar rango de fechas
  const handleDateSelect = (selectInfo) => {
    Swal.fire({
      title: "Crear nueva renta",
      html: `
        <p>Rango seleccionado:</p>
        <p><strong>${formatDateTime(selectInfo.startStr)}</strong></p>
        <p>hasta</p>
        <p><strong>${formatDateTime(selectInfo.endStr)}</strong></p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0d6efd",
      confirmButtonText: "Crear renta",
      cancelButtonText: "Cancelar"
    }).then((result) => {
      if (result.isConfirmed) {
        setSelectedDate({
          start: selectInfo.startStr,
          end: selectInfo.endStr
        });
        setRentalToEdit(null);
        setIsWizardOpen(true);
      }
    });
  };

  const formatDateOnly = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-MX", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  // Handlers de acciones
  const handleEditRental = (rental) => {
    setRentalToEdit(rental);
    setIsWizardOpen(true);
  };

  const handleChangeStatus = (rental) => {
    Swal.fire({
      title: "Cambiar estado de la renta",
      html: `
        <div class="d-flex flex-column gap-2">
          ${rental.status === 'CREATED' ? `
            <button id="btn-delivered" class="btn btn-warning">
              <i class="bi bi-truck me-1"></i> Marcar como Entregada
            </button>
          ` : ''}
          ${rental.status === 'DELIVERED' ? `
            <button id="btn-pickedup" class="btn btn-success">
              <i class="bi bi-check-circle me-1"></i> Marcar como Recogida
            </button>
          ` : ''}
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: "Cerrar",
      didOpen: () => {
        document.getElementById("btn-delivered")?.addEventListener("click", async () => {
          await changeStatus(rental.id, "DELIVERED");
        });
        document.getElementById("btn-pickedup")?.addEventListener("click", async () => {
          await changeStatus(rental.id, "PICKED_UP");
        });
      }
    });
  };

  const changeStatus = async (id, status) => {
    try {
      await updateRentalStatus(id, status);
      Swal.fire("Actualizado", "El estado fue actualizado correctamente", "success");
      getRentals();
    } catch (error) {
      const backendMsg = error.response?.data?.message || error.response?.data;
      if (backendMsg && String(backendMsg).includes("Falta por cobrar")) {
        Swal.fire({
          icon: 'warning',
          title: 'Pago incompleto',
          html: `<p>${String(backendMsg)}</p><p class="text-muted mt-2">Registra el pago de la cantidad faltante para poder liberar o marcar esta renta como recogida.</p>`,
          confirmButtonText: 'Entendido'
        });
      } else {
        Swal.fire('Error', String(backendMsg || 'No se pudo cambiar el estado'), 'error');
      }
    }
  };

  const handleCancelRental = async (rental) => {
    const result = await Swal.fire({
      title: "¿Cancelar renta?",
      text: "La renta será marcada como cancelada",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Volver"
    });

    if (result.isConfirmed) {
      try {
        await updateRentalStatus(rental.id, "CANCELLED");
        Swal.fire("Cancelada", "La renta fue cancelada", "success");
        getRentals();
      } catch {
        Swal.fire("Error", "No se pudo cancelar la renta", "error");
      }
    }
  };

  const handleDeactivateRental = async (id, reason) => {
    await deactivate(id, reason, userId);
    getRentals();
  };

  // Cerrar wizard
  const handleCloseWizard = () => {
    setIsWizardOpen(false);
    setRentalToEdit(null);
    setSelectedDate(null);
  };

  const handleSuccess = () => {
    getRentals();
  };

  // Abrir modal de pagos
  const handlePayment = (rental) => {
    setPaymentRental(rental)
  }

  return (
    <div className="calendar-page">
      {/* Header */}

      <ModuleHeader title="Calendario">
        <div className="col-12 col-lg-auto">
          <button
            className="btn btn-primary w-100"
            onClick={() => {
              setRentalToEdit(null);
              setSelectedDate(null);
              setIsWizardOpen(true);
            }}
          >
            <i className="bi bi-plus-lg me-1"></i> Agregar Nueva Renta
          </button>
        </div>

        <div className="col-12 col-lg">
          <input
            ref={searchRef}
            type="text"
            className="form-control"
            placeholder="Buscar por ID, cliente, teléfono, dirección o producto..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setSearchOpen(e.target.value.trim().length > 0);
            }}
            onFocus={() => { if (searchTerm.trim()) setSearchOpen(true); }}
          />
        </div>

        <div className="col-12 col-lg-auto">
          <div className="calendar-legend" ref={statusDropdownRef}>
            <span className="legend-title">Estado:</span>
            {Object.entries(statusColors).map(([status, colors]) => {
              const count = getRentalsByStatus(status).length;
              return (
                <span
                  key={status}
                  className={`legend-item legend-item-clickable ${activeStatusDropdown === status ? 'legend-item-active' : ''}`}
                  style={{ '--status-color': colors.bg, '--status-glow': colors.glow }}
                  onClick={() => setActiveStatusDropdown(activeStatusDropdown === status ? null : status)}
                >
                  {statusLabels[status]} ({count})
                </span>
              );
            })}
          </div>
        </div>

      </ModuleHeader>

      <div className="calendar-dropdowns-wrapper">
        {/* Dropdown de búsqueda */}
        {searchOpen && searchTerm.trim() && (
          <div className="calendar-dropdown-container" ref={searchDropdownRef}>
            <div className="calendar-dropdown">
              {getSearchResults().length === 0 ? (
                <div className="text-center text-muted py-3">
                  <i className="bi bi-search display-6 d-block mb-2"></i>
                  <p className="mb-0">No se encontraron resultados</p>
                </div>
              ) : (
                getSearchResults().map(rental => renderRentalItem(rental))
              )}
            </div>
          </div>
        )}

        {/* Dropdown de status */}
        {activeStatusDropdown && (
          <div className="calendar-dropdown-container calendar-dropdown-right">
            <div className="calendar-dropdown">
              <h6 className="mb-2 px-2">
                {statusLabels[activeStatusDropdown]} ({getRentalsByStatus(activeStatusDropdown).length})
              </h6>
              {getRentalsByStatus(activeStatusDropdown).length === 0 ? (
                <div className="text-center text-muted py-3">
                  <p className="mb-0">No hay rentas con este estado</p>
                </div>
              ) : (
                getRentalsByStatus(activeStatusDropdown).map(rental => renderRentalItem(rental))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Calendario */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
        </div>
      ) : (
        <div className="calendar-container">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay"
            }}
            buttonText={{
              today: "Hoy",
              month: "Mes",
              week: "Semana",
              day: "Día"
            }}
            locale="es"
            firstDay={0}
            events={events}
            eventClick={handleEventClick}
            dateClick={handleDateClick}
            selectable={true}
            select={handleDateSelect}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            }}
            slotMinTime="06:00:00"
            slotMaxTime="23:00:00"
            allDaySlot={false}
            height="auto"
            eventOverlap={false}
            slotEventOverlap={false}
            eventMaxStack={3}
            dayMaxEvents={4}
            moreLinkText={(num) => `+${num} más`}
            nowIndicator={true}
            navLinks={true}
          />
        </div>
      )}

      {/* Wizard */}
      {isWizardOpen && (
        <RentalWizard
          onClose={handleCloseWizard}
          onSuccess={handleSuccess}
          userId={userId}
          rentalToEdit={rentalToEdit}
          initialDate={selectedDate}
        />
      )}

      {/* Modal de detalles de renta */}
      {selectedRental && (
        <RentalDetailModal
          rental={selectedRental}
          onClose={() => setSelectedRental(null)}
          onEdit={handleEditRental}
          onChangeStatus={handleChangeStatus}
          onCancel={handleCancelRental}
          onDeactivate={handleDeactivateRental}
          onPayment={handlePayment}
        />
      )}

      {/* Modal de pagos */}
      {paymentRental && (
        <PaymentModal
          rental={paymentRental}
          onClose={() => setPaymentRental(null)}
          onPaymentCreated={() => getRentals()}
        />
      )}
    </div>
  );
};

export default CalendarPage;
