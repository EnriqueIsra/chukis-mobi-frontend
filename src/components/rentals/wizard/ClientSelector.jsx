const ClientSelector = ({ clients, value, onChange }) => {
  return (
    <select
      className="form-select"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
    >
      <option value="">-- Selecciona un cliente --</option>
      {clients.map((client) => (
        <option key={client.id} value={client.id}>
          {client.nombre} · {client.telefono}
        </option>
      ))}
    </select>
  );
};

export default ClientSelector;
