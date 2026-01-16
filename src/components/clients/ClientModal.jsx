import PropTypes from "prop-types";
import { ClientForm } from "./ClientForm";

export const ClientModal = ({ isOpen, onClose, handlerAdd, clientSelected }) => {
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
                {clientSelected.id > 0 ? 'Editar Cliente' : 'Agregar Cliente'}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <ClientForm
                formId="client-modal-form"
                handlerAdd={(client) => {
                  handlerAdd(client);
                  onClose();
                }}
                clientSelected={clientSelected}
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
                form="client-modal-form"
                className="btn btn-primary"
              >
                {clientSelected.id > 0 ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

ClientModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  handlerAdd: PropTypes.func.isRequired,
  clientSelected: PropTypes.object.isRequired
};
