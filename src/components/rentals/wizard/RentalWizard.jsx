export const RentalWizard = ({ onClose }) => {
  return (
    <>
      <div className="modal-backdrop fade show"></div>

      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">Nueva Renta</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>

            <div className="modal-body">
              <p>Wizard de renta (pasos)</p>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose}>
                Cerrar
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};
