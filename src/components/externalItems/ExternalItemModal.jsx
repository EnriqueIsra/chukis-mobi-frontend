import PropTypes from "prop-types";
import Swal from "sweetalert2";
import { ExternalItemForm } from "./ExternalItemForm";

export const ExternalItemModal = ({ isOpen, onClose, handlerAdd, itemSelected, providers, lockRentalId = false }) => {
  if (!isOpen) return null;

  const isEditing = itemSelected.id > 0;

  const handleSave = async (item) => {
    await handlerAdd(item);
    if (isEditing) {
      onClose();
    } else {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Ítem registrado",
        showConfirmButton: false,
        timer: 2000
      });
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={onClose}
        style={{ zIndex: 1040 }}
      ></div>

      {/* Modal */}
      <div
        className="modal fade show d-block"
        tabIndex="-1"
        style={{ zIndex: 1050 }}
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {isEditing ? "Editar Ítem" : "Registrar Ítem Externo"}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <ExternalItemForm
                formId="external-item-modal-form"
                handlerAdd={handleSave}
                itemSelected={itemSelected}
                providers={providers}
                lockRentalId={lockRentalId}
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className={`btn ${isEditing ? "btn-danger" : "btn-secondary"}`}
                onClick={onClose}
              >
                {isEditing ? "Cancelar" : "Cerrar"}
              </button>
              <button
                type="submit"
                form="external-item-modal-form"
                className="btn btn-primary"
              >
                {isEditing ? "Actualizar" : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

ExternalItemModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  handlerAdd: PropTypes.func.isRequired,
  itemSelected: PropTypes.object.isRequired,
  providers: PropTypes.array.isRequired,
  lockRentalId: PropTypes.bool
};
