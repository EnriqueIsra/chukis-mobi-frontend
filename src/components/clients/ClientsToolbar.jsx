export const ClientsToolbar = ({ viewMode, setViewMode }) => {
  return (
    <div className="d-flex gap-2 w-100">
      <button
        className={`btn flex-grow-1 ${
          viewMode === "table" ? "btn-primary" : "btn-outline-primary"
        }`}
        onClick={() => setViewMode("table")}
      >
        <i className="bi bi-table"></i> Ver Tabla
      </button>

      <button
        className={`btn flex-grow-1 ${
          viewMode === "cards" ? "btn-primary" : "btn-outline-primary"
        }`}
        onClick={() => setViewMode("cards")}
      >
        <i className="bi bi-grid-3x3-gap"></i> Ver Cuadrícula
      </button>
    </div>
  );
};
