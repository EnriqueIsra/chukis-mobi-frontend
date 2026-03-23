export const UsersToolbar = ({ viewMode, setViewMode }) => {
  return (
    <div className="btn-group">
      <button
        className={`btn btn-outline-secondary ${viewMode === "cards" ? "active" : ""}`}
        onClick={() => setViewMode("cards")}
      >
        <i className="bi bi-grid me-1"></i>Cards
      </button>
      <button
        className={`btn btn-outline-secondary ${viewMode === "table" ? "active" : ""}`}
        onClick={() => setViewMode("table")}
      >
        <i className="bi bi-list-ul me-1"></i>Tabla
      </button>
    </div>
  );
};
