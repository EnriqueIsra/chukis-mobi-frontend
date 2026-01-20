const RentalTable = ({ rentals }) => {
  return (
    <table className="table table-bordered table-hover">
      <thead className="table-light">
        <tr>
          <th>#</th>
          <th>Cliente</th>
          <th>Fechas</th>
          <th>Dirección</th>
          <th>Total</th>
          <th>Estado</th>
        </tr>
      </thead>
      <tbody>
        {rentals.length === 0 && (
          <tr>
            <td colSpan="6" className="text-center">
              No hay rentas registradas
            </td>
          </tr>
        )}

        {rentals.map((rental) => (
          <tr key={rental.id}>
            <td>{rental.id}</td>
            <td>{rental.client?.nombre}</td>
            <td>
              {rental.startDate} <br />
              {rental.endDate}
            </td>
            <td>{rental.address}</td>
            <td>${rental.total}</td>
            <td>
              <span className="badge bg-info">
                {rental.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default RentalTable;
