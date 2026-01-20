import RentalWizard from "./wizard/RentalWizard";

const RentalModal = ({ onClose }) => {
  return (
    <div className="modal d-block">
      <div className="modal-dialog modal-lg modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Nueva Renta</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <RentalWizard onCancel={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalModal;
