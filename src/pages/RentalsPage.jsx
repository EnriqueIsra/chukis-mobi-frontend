import { useState } from "react";
import Swal from "sweetalert2";
import { RentalsToolbar } from "../components/rentals/RentalToolBar";
import { RentalWizard } from "../components/rentals/wizard/RentalWizard";

export const RentalsPage = () => {

  const [viewMode, setViewMode] = useState("table");
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  const handlerOpenWizard = () => {
    setIsWizardOpen(true);
  };

  const handlerCloseWizard = () => {
    setIsWizardOpen(false);
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

      {/* Placeholder temporal */}
      <div className="alert alert-info">
        Aquí se listarán las rentas ({viewMode})
      </div>

      {/* Wizard */}
      {isWizardOpen && (
        <RentalWizard onClose={handlerCloseWizard} />
      )}
    </>
  );
};
