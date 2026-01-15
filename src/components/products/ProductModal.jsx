import PropTypes from "prop-types";
import { ProductForm } from "./ProductForm";

export const ProductModal = ({ isOpen, onClose, handlerAdd, productSelected }) => {
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
                {productSelected.id > 0 ? 'Editar Producto' : 'Agregar Producto'}
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <ProductForm
                formId="product-modal-form"
                handlerAdd={(product) => {
                  handlerAdd(product);
                  onClose();
                }}
                productSelected={productSelected}
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
                form="product-modal-form"
                className="btn btn-primary"
              >
                {productSelected.id > 0 ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

ProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  handlerAdd: PropTypes.func.isRequired,
  productSelected: PropTypes.object.isRequired
};
