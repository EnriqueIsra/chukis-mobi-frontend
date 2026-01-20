import { useState, useEffect } from "react";
import StepDates from "./StepDates";
import StepProducts from "./StepProducts";
import StepClient from "./StepClient";
import StepSummary from "./StepSummary";

const STEPS = ["Fechas", "Productos", "Cliente", "Resumen"];

export const RentalWizard = ({ onClose, onSuccess, userId, rentalToEdit }) => {
  const isEditMode = !!rentalToEdit;

  const [currentStep, setCurrentStep] = useState(0);
  const [rentalData, setRentalData] = useState({
    id: rentalToEdit?.id || null,
    startDate: rentalToEdit?.startDate || "",
    endDate: rentalToEdit?.endDate || "",
    items: rentalToEdit?.items?.map(item => ({
      productId: item.productId,
      name: item.productName,
      quantity: item.quantity,
      price: item.unitPrice
    })) || [],
    clientId: rentalToEdit?.client?.id || "",
    address: rentalToEdit?.address || "",
    userId: userId
  });

  // Verificar que hay un usuario logueado
  if (!userId) {
    return (
      <>
        <div className="modal-backdrop fade show" style={{ zIndex: 1040 }}></div>
        <div className="modal d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Error
                </h5>
                <button className="btn-close" onClick={onClose}></button>
              </div>
              <div className="modal-body text-center">
                <p>No se pudo identificar al usuario logueado.</p>
                <p className="text-muted">Por favor, cierra sesión e inicia sesión nuevamente.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepDates
            rentalData={rentalData}
            setRentalData={setRentalData}
            onNext={handleNext}
            onCancel={onClose}
          />
        );
      case 1:
        return (
          <StepProducts
            rentalData={rentalData}
            setRentalData={setRentalData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <StepClient
            rentalData={rentalData}
            setRentalData={setRentalData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <StepSummary
            rentalData={rentalData}
            onBack={handleBack}
            onFinish={handleFinish}
            isEditMode={isEditMode}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div
        className="modal-backdrop fade show"
        style={{ zIndex: 1040 }}
      ></div>

      <div
        className="modal d-block"
        tabIndex="-1"
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className={`bi ${isEditMode ? 'bi-pencil-square' : 'bi-calendar-plus'} me-2`}></i>
                {isEditMode ? `Editar Renta #${rentalToEdit.id}` : 'Nueva Renta'}
              </h5>
              <button
                className="btn-close"
                onClick={onClose}
              ></button>
            </div>

            {/* Progress indicator */}
            <div className="px-4 pt-3">
              <div className="d-flex justify-content-between mb-2">
                {STEPS.map((step, index) => (
                  <div
                    key={step}
                    className={`text-center flex-fill ${
                      index <= currentStep ? "text-primary" : "text-muted"
                    }`}
                  >
                    <div
                      className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                        index < currentStep
                          ? "bg-success text-white"
                          : index === currentStep
                          ? "bg-primary text-white"
                          : "bg-light text-muted"
                      }`}
                      style={{ width: "32px", height: "32px" }}
                    >
                      {index < currentStep ? (
                        <i className="bi bi-check"></i>
                      ) : (
                        index + 1
                      )}
                    </div>
                    <div className="small mt-1">{step}</div>
                  </div>
                ))}
              </div>
              <div className="progress" style={{ height: "4px" }}>
                <div
                  className="progress-bar"
                  style={{
                    width: `${((currentStep + 1) / STEPS.length) * 100}%`
                  }}
                ></div>
              </div>
            </div>

            <div className="modal-body pt-4">
              {renderStep()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
