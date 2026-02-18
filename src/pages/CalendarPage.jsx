import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { findAll, remove, updateRentalStatus } from "../services/rentalService";
import { RentalWizard } from "../components/rentals/wizard/RentalWizard";
import "./CalendarPage.css";
import RentalDetailModal from "../components/rentals/RentalDetailModal";
import PaymentModal from "../components/payments/PaymentModal";

// Colores según status
const statusColors = {
  CREATED: { bg: "#0dcaf0", border: "#0aa2c0", text: "#000" },      // info/azul
  DELIVERED: { bg: "#ffc107", border: "#d39e00", text: "#000" },    // warning/amarillo
  PICKED_UP: { bg: "#198754", border: "#146c43", text: "#fff" },    // success/verde
  CANCELLED: { bg: "#dc3545", border: "#b02a37", text: "#fff" }     // danger/rojo
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
      Swal.fire("Error", "No se pudo cambiar el estado", "error");
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

  const handleDeleteRental = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar renta?",
      text: "Esta acción no se puede deshacer",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar"
    });

    if (result.isConfirmed) {
      try {
        await remove(id);
        Swal.fire("Eliminada", "La renta ha sido eliminada", "success");
        getRentals();
      } catch (error) {
        Swal.fire("Error", "No se pudo eliminar la renta", "error");
      }
    }
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
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">
          <i className="bi bi-calendar3 me-2"></i>
          Calendario de Rentas
        </h2>
        <button
          className="btn btn-primary"
          onClick={() => {
            setRentalToEdit(null);
            setSelectedDate(null);
            setIsWizardOpen(true);
          }}
        >
          <i className="bi bi-plus-lg me-1"></i> Nueva Renta
        </button>
      </div>

      {/* Leyenda de colores */}
      <div className="calendar-legend mb-3">
        <span className="legend-title">Estado:</span>
        {Object.entries(statusColors).map(([status, colors]) => (
          <span
            key={status}
            className="legend-item"
            style={{ backgroundColor: colors.bg, color: colors.text }}
          >
            {statusLabels[status]}
          </span>
        ))}
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
          onDelete={handleDeleteRental}
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
