import PropTypes from "prop-types";
import { ExpenseForm } from "./ExpenseForm";

export const ExpenseModal = ({ isOpen, onClose, handlerAdd, expenseSelected }) => {
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
                {expenseSelected.id > 0 ? 'Editar Gasto' : 'Registrar Gasto'}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <ExpenseForm
                formId="expense-modal-form"
                handlerAdd={(expense) => {
                  handlerAdd(expense);
                  onClose();
                }}
                expenseSelected={expenseSelected}
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
                form="expense-modal-form"
                className="btn btn-primary"
              >
                {expenseSelected.id > 0 ? 'Actualizar' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

ExpenseModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  handlerAdd: PropTypes.func.isRequired,
  expenseSelected: PropTypes.object.isRequired
};
