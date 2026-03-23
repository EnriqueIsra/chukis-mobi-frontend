import PropTypes from "prop-types";
import { WorkerPaymentForm } from "./WorkerPaymentForm";

export const WorkerPaymentModal = ({ isOpen, onClose, handlerAdd, paymentSelected, users }) => {
    if (!isOpen) return null;

    return (
        <>
            <div
                className="modal-backdrop fade show"
                onClick={onClose}
                style={{ zIndex: 1040 }}
            ></div>
            <div
                className="modal fade show d-block"
                tabIndex="-1"
                style={{ zIndex: 1050 }}
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {paymentSelected.id > 0 ? "Editar Pago" : "Registrar Pago"}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                onClick={onClose}
                                aria-label="Close"
                            ></button>
                        </div>
                        <div className="modal-body">
                            <WorkerPaymentForm
                                formId="worker-payment-modal-form"
                                handlerAdd={(payment) => {
                                    handlerAdd(payment);
                                    onClose();
                                }}
                                paymentSelected={paymentSelected}
                                users={users}
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
                                form="worker-payment-modal-form"
                                className="btn btn-primary"
                            >
                                {paymentSelected.id > 0 ? "Actualizar" : "Registrar"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

WorkerPaymentModal.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    handlerAdd: PropTypes.func.isRequired,
    paymentSelected: PropTypes.object.isRequired,
    users: PropTypes.array.isRequired
};
