import PropTypes from "prop-types";

export const RentalProfitabilityCard = ({ profitability }) => {
  if (!profitability) return null;

  const { rentalTotal, totalExternalCost, netProfit } = profitability;
  const isProfit = netProfit >= 0;

  return (
    <div className={`card mb-4 border-${isProfit ? "success" : "danger"}`}>
      <div className="card-header fw-bold">
        Rentabilidad - Renta #{profitability.rentalId}
      </div>
      {/* Hover actions */}
      <div className="card-body">
        <div className="row text-center">
          <div className="col">
            <div className="text-muted small">Ingreso total</div>
            <div className="fs-5 fw-bold text-dark">
              ${rentalTotal.toLocaleString()}
            </div>
          </div>
          <div className="col">
            <div className="text-muted small">Costo externo</div>
            <div className="fs-5 fw-bold text-danger">
              -${totalExternalCost.toLocaleString()}
            </div>
          </div>
          <div className="col">
            <div className="text-muted small">Ganancia neta</div>
            <div
              className={`fs-5 fw-bold text-${isProfit ? "success" : "danger"}`}
            >
              ${netProfit.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

RentalProfitabilityCard.propTypes = {
    profitability: PropTypes.object
}
