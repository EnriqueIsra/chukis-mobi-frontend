import PropTypes from "prop-types";
import { ExternalItemForm } from "./ExternalItemForm";

export const ExternalItemModal = ({ isOpen, onClose, handlerAdd, itemSelected, providers }) => {
  if (!isOpen) return null;

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
                {itemSelected.id > 0 ? 'Editar Ítem' : 'Registrar Ítem Externo'}
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
                handlerAdd={(item) => {
                  handlerAdd(item);
                  onClose();
                }}
                itemSelected={itemSelected}
                providers={providers}
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-danger"
                onClick={onClose}
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="external-item-modal-form"
                className="btn btn-primary"
              >
                {itemSelected.id > 0 ? 'Actualizar' : 'Registrar'}
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
  providers: PropTypes.array.isRequired
};
