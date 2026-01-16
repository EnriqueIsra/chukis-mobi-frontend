import PropTypes from "prop-types";

export const ClientTable = ({ clients, handlerClientSelected, handlerRemoveClient }) => {
  return (
    <table className="table table-hover table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Nombre</th>
          <th>Teléfono</th>
          <th>Email</th>
          <th>Dirección</th>
          <th>Editar</th>
          <th>Eliminar</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((client) => {
          return (
            <tr key={client.id}>
              <td>{client.id}</td>
              <td>{client.nombre}</td>
              <td>
                <i className="bi bi-telephone me-1"></i>
                {client.telefono}
              </td>
              <td>
                <i className="bi bi-envelope me-1"></i>
                {client.email}
              </td>
              <td>
                <i className="bi bi-geo-alt me-1"></i>
                {client.direccion}
              </td>
              <td>
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => handlerClientSelected(client)}
                >
                  <i className="bi bi-pencil"></i>
                </button>
              </td>
              <td>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handlerRemoveClient(client.id)}
                >
                  <i className="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  );
};

ClientTable.propTypes = {
  clients: PropTypes.array.isRequired,
  handlerClientSelected: PropTypes.func.isRequired,
  handlerRemoveClient: PropTypes.func.isRequired
};
