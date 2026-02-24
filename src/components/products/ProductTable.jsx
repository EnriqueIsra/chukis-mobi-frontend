import PropTypes from "prop-types";

export const ProductTable = ({ products, handlerProductSelected, handlerRemoveProduct }) => {
  return (
    <div className="table-responsive">
      <table className="table table-hover table-striped">
        <thead>
          <tr>
            <th className="d-none d-md-table-cell">ID</th>
            <th>Nombre</th>
            <th className="d-none d-md-table-cell">Descripción</th>
            <th className="d-none d-md-table-cell">Color</th>
            <th>Stock</th>
            <th>Precio</th>
            <th>Editar</th>
            <th>Eliminar</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => {
            return (
              <tr key={product.id}>
                <td className="d-none d-md-table-cell">{product.id}</td>
                <td>{product.name}</td>
                <td className="d-none d-md-table-cell">{product.description}</td>
                <td className="d-none d-md-table-cell">{product.color}</td>
                <td>{product.stock}</td>
                <td>${product.price}</td>
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
