export const RentalsToolbar = ({ viewMode, setViewMode }) => {
  return (
    <div className="d-flex justify-content-end mb-3 gap-2">
      <button
        className={`btn btn-sm ${
          viewMode === "table" ? "btn-primary" : "btn-outline-primary"
        }`}
        onClick={() => setViewMode("table")}
      >
        <i className="bi bi-table"></i>
      </button>

      <button
        className={`btn btn-sm ${
          viewMode === "cards" ? "btn-primary" : "btn-outline-primary"
        }`}
        onClick={() => setViewMode("cards")}
      >
        <i className="bi bi-grid-3x3-gap"></i>
      </button>
    </div>
  );
};
