import React from "react";

const Lender = ({ assets, onSupplyClick, isConnected }) => (
  <div className="col-md-6 mb-4">
    <div className="glass-card-custom p-4 h-100 rounded-4 shadow-sm">
      <h5 className="text-center fw-bold text-primary mb-4">
        Assets to Supply <span className="badge bg-light text-dark">Fuji</span>
      </h5>
      <div className="table-responsive">
        <table className="table table-borderless table-glass text-white mb-0">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Balance</th>
              <th>Collateral</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {assets.map((asset) => (
              <tr key={asset.symbol}>
                <td>
                  <div className="d-flex align-items-center gap-2">
                    <img
                      src={asset.icon}
                      alt={asset.symbol}
                      width="28"
                      height="28"
                      className="rounded-circle border"
                    />
                    <strong>{asset.symbol}</strong>
                  </div>
                </td>
                <td>{parseFloat(asset.balance).toFixed(4)}</td>
             
                <td>
                  {asset.collateral ? (
                    <i className="bi bi-check-circle-fill text-success" />
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-light rounded-pill px-3"
                    onClick={() => onSupplyClick(asset)}
                    disabled={!isConnected}
                  >
                    Supply
                  </button>
                </td>
              </tr>
            ))}
            {assets.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-muted py-3">
                  No assets available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default Lender;
