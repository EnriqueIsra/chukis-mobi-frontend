export const ProductsToolbar = ({
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm
}) => {
  return (
    <div className="d-flex justify-content-end mb-3 gap-2">

      {/* 🔍 BUSCADOR */}
      <input
        type="text"
        className="form-control"
        style={{ maxWidth: "300px" }}
        placeholder="Buscar por nombre, descripción o precio..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* BOTONES DE VISTA */}
      <div className="d-flex gap-2">
        <button
          className={`btn btn-sm ${viewMode === "table" ? "btn-primary" : "btn-outline-primary"
            }`}
          onClick={() => setViewMode("table")}
        >
          <i className="bi bi-table"></i>
        </button>

        <button
          className={`btn btn-sm ${viewMode === "cards" ? "btn-primary" : "btn-outline-primary"
            }`}
          onClick={() => setViewMode("cards")}
        >
          <i className="bi bi-grid-3x3-gap"></i>
        </button>
      </div>
    </div>
  );
};
