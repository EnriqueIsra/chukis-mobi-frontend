import PropTypes from "prop-types";

export const ProductTable = ({ products, handlerProductSelected, handlerRemoveProduct }) => {
  return (
    <table className="table table-hover table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Descripción</th>
          <th>Color</th>
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
              <td>{product.id}</td>
              <td>{product.name}</td>
              <td>{product.description}</td>
              <td>{product.color}</td>
              <td>{product.stock}</td>
              <td>${product.price}</td>
              <td><button className="btn btn-sm btn-primary"
              onClick={() => handlerProductSelected(product)} >update</button></td>
              <td><button className="btn btn-sm btn-danger"
              onClick={() => handlerRemoveProduct(product.id)}>remove</button></td>
            </tr>
          )
        })}
      </tbody>
    </table>
  );
};
ProductTable.propTypes = {
  products: PropTypes.array.isRequired,
  handlerProductSelected: PropTypes.func.isRequired,
  handlerRemoveProduct: PropTypes.func.isRequired
};
