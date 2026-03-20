import PropTypes from "prop-types";
import Swal from "sweetalert2"

export const ProviderTable = ({ providers, onEdit, onDeactivate, onActivate, showInactive }) => {

    constHandleDeactivate = async (provider) => {
        const result = await Swal.fire({
            title: "¿Desactivar proveedor?",
            input: "textarea",
            inputLabel: "Motivo de desactivación",
            inputPlaceholder: "Escribe el motivo...",
            inputValidator: (value) => {
                if (!value) return "El motivo es obligatorio"
            },
            showCancelButton: true,
            confirmButtonText: "Desactivar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#d33"
        })
        if (result.isConfirmed) {
            onDeactivate(provider.id, result.value)
        }
    }

  return (
    <div className="table-responsive">
      <table className="table table-hover align-middle">
        <thead className="table-dark">
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Notas</th>
            {showInactive && <th>Motivo desactivación</th>}
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {providers.map((provider) => {
            return (
              <tr key={provider.id} className={`!provider.active ? "table-secondary" : ""`}>
                <td>{provider.id}</td>
                <td>{provider.phone}</td>
                <td>{provider.notes || "-"}</td>
                <td>{provider.color}</td>
                <td>{provider.stock}</td>
                <td>${provider.price}</td>
                <td>
                  <button className="btn btn-sm btn-primary"
                    onClick={() => handlerProductSelected(product)}><i className="bi bi-pencil"></i><span className="d-none d-md-inline"> Editar</span>
                  </button>
                </td>
                <td>
                  <button className="btn btn-sm btn-danger"
                    onClick={() => handlerRemoveProduct(product.id)}><i className="bi bi-trash"></i><span className="d-none d-md-inline"> Eliminar</span>
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

    </div>
  );
};
ProductTable.propTypes = {
  products: PropTypes.array.isRequired,
  handlerProductSelected: PropTypes.func.isRequired,
  handlerRemoveProduct: PropTypes.func.isRequired
};
