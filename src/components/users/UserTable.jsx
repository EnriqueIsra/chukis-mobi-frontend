import PropTypes from "prop-types";

export const UserTable = ({ users, handlerUserSelected, handlerRemoveUser }) => {
  return (
    <table className="table table-hover table-striped">
      <thead>
        <tr>
          <th>id</th>
          <th>usuario</th>
          <th>rol</th>
          <th>imagen</th>
          <th>editar</th>
          <th>eliminar</th>
        </tr>
      </thead>
      <tbody>
        {users.map((user) => {
          return (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.username}</td>
              <td>{user.role}</td>
              <td>{user.imageUrl}</td>
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
