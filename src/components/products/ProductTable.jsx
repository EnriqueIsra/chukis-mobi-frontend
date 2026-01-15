import PropTypes from "prop-types";

export const ProductTable = ({ products, handlerProductSelected, handlerRemoveProduct }) => {
  return (
    <table className="table table-hover table-striped">
      <thead>
        <tr>
          <th>id</th>
          <th>name</th>
          <th>description</th>
          <th>color</th>
          <th>stock</th>
          <th>price</th>
          <th>imageUrl</th>
          <th>update</th>
          <th>remove</th>
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
              <td>
                {product.imageUrl ? (
                  <a href={product.imageUrl} target="_blank" rel="noopener noreferrer" className="text-truncate d-inline-block" style={{maxWidth: '150px'}}>
                    {product.imageUrl}
                  </a>
                ) : (
                  <span className="text-muted">Sin imagen</span>
                )}
              </td>
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
