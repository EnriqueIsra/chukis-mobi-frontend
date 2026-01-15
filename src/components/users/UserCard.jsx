import './userCard.css';

export const UserCard = ({ user, onEdit, onRemove }) => {
  return (
    <div className="col-12 col-sm-6 col-md-6 col-lg-4 col-xl-3 mb-3">
      <div className="card user-card h-100 shadow-sm position-relative">

        {/* Hover actions */}
        <div className="card-actions">
          <button
            className="btn btn-sm btn-light"
            onClick={() => onEdit(user)}
          >
            <i className="bi bi-pencil"></i>
          </button>
          <button
            className="btn btn-sm btn-danger"
            onClick={() => onRemove(user.id)}
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>

        {/* Image */}
        <img
          src={user.imageUrl || "https://via.placeholder.com/300"}
          className="card-img-top"
          style={{ height: "180px", objectFit: "cover" }}
          alt={user.username}
        />

        {/* Body */}
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="fw-bold mb-0">{user.username}</h6>
            <span className="badge bg-primary">{user.role}</span>
          </div>

          <p className="text-muted small mt-2">
            Usuario del sistema ChukisApp
          </p>
        </div>

        {/* Footer */}
        <div className="card-footer bg-white">
          <small className="text-muted">ID: {user.id}</small>
        </div>
      </div>
    </div>
  );
};
