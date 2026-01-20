import PropTypes from "prop-types";

export const UserTable = ({ users, handlerUserSelected, handlerRemoveUser }) => {
  return (
    <table className="table table-hover table-striped">
      <thead>
        <tr>
          <th>ID</th>
          <th>Usuario</th>
          <th>Rol</th>
          <th>Teléfono</th>
          <th>Editar</th>
          <th>Eliminar</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => {
          return (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>
                <i className="bi bi-telephone me-1"></i>
                {user.telefono}
              </td>
              <td><button className="btn btn-sm btn-primary"
              onClick={() => handlerUserSelected(user)} >editar</button></td>
              <td><button className="btn btn-sm btn-danger"
              onClick={() => handlerRemoveUser(user.id)}>eliminar</button></td>
            </tr>
          )
        })}
      </tbody>
    </table>
  );
};
UserTable.propTypes = {
  users: PropTypes.array.isRequired,
  handlerUserSelected: PropTypes.func.isRequired,
  handlerRemoveUser: PropTypes.func.isRequired
};
