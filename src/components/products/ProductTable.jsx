import PropTypes from "prop-types";
import Swal from "sweetalert2";

export const ProductTable = ({ products, onEdit, onDeactivate, onActivate, showInactive }) => {

  const handleDeactivate = async (product) => {
    const result = await Swal.fire({
      title: "¿Desactivar producto?",
      input: "textarea",
      inputLabel: "Motivo de desactivación",
      inputPlaceholder: "Escribe el motivo...",
      inputValidator: (value) => {
        if (!value) return "El motivo es obligatorio";
      },
      showCancelButton: true,
      confirmButtonText: "Desactivar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33"
    });
    if (result.isConfirmed) {
      onDeactivate(product.id, result.value);
    }
  };

  return (
    <div className="table-responsive">
      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th className="d-none d-md-table-cell">ID</th>
            <th>Nombre</th>
            <th className="d-none d-md-table-cell">Descripción</th>
            <th className="d-none d-md-table-cell">Color</th>
            <th>Stock</th>
            <th>Precio</th>
            {showInactive && <th>Motivo desactivación</th>}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className={!product.active ? "table-secondary" : ""}>
              <td className="d-none d-md-table-cell">{product.id}</td>
              <td>{product.name}</td>
              <td className="d-none d-md-table-cell">{product.description}</td>
              <td className="d-none d-md-table-cell">{product.color}</td>
              <td>{product.stock}</td>
              <td>${product.price}</td>
              {showInactive && <td>{product.desactivationReason || "—"}</td>}
              <td>
                <div className="d-flex gap-1 flex-wrap">
                  {product.active ? (
                    <>
                      <button className="btn btn-sm btn-outline-primary"
                        onClick={() => onEdit(product)}>
                        <i className="bi bi-pencil"></i>
                        <span className="d-none d-md-inline"> Editar</span>
                      </button>
                      <button className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeactivate(product)}>
                        <i className="bi bi-trash"></i>
                        <span className="d-none d-md-inline"> Desactivar</span>
                      </button>
                    </>
                  ) : (
                    <button className="btn btn-sm btn-outline-success"
                      title="Reactivar"
                      onClick={async () => {
                        const result = await Swal.fire({
                          title: "¿Reactivar producto?",
                          text: `Se reactivará "${product.name}"`,
                          icon: "question",
                          showCancelButton: true,
                          confirmButtonText: "Reactivar",
                          cancelButtonText: "Cancelar",
                          confirmButtonColor: "#198754"
                        });
                        if (result.isConfirmed) onActivate(product.id);
                      }}>
                      <i className="bi bi-arrow-counterclockwise"></i>
                      <span className="d-none d-md-inline"> Reactivar</span>
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && (
            <tr>
              <td colSpan="8" className="text-center text-muted py-4">
                No hay productos registrados
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

ProductTable.propTypes = {
  products: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDeactivate: PropTypes.func.isRequired,
  onActivate: PropTypes.func.isRequired,
  showInactive: PropTypes.bool.isRequired
};
