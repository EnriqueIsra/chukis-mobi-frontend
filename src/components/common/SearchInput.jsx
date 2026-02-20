export const SearchInput = ({ value, onChange, placeholder = "Buscar..." }) => {
  return (
    <div className="input-group">
      <span className="input-group-text">
        <i className="bi bi-search"></i>
      </span>

      <input
        type="text"
        className="form-control"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />

      {value && (
        <button
          className="btn btn-outline-secondary"
          onClick={() => onChange("")}
          title="Limpiar"
        >
          ✖
        </button>
      )}
    </div>
  );
};
