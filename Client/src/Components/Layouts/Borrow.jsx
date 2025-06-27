import React from "react";

const Borrower = ({ assets, onBorrowClick, isConnected }) => (
  <div className="col-md-6 mb-4">
    <div className="glass-card-custom p-4 h-100 rounded-4 shadow-sm">
      <h5 className="text-center fw-bold text-primary mb-4">
        Assets to Borrow{" "}
        <span className="badge bg-light text-dark">Sepolia</span>
      </h5>
      <div className="table-responsive">
        <table className="table table-borderless table-glass text-white mb-0">
          {" "}
          <thead>
            <tr>
              <th>Asset</th>
              <th>Available</th>
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
                      width="24"
                      height="24"
                    />
                    <span>{asset.symbol}</span>
                  </div>
                </td>
                <td>{asset.available}</td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-light rounded-pill px-3"
                    onClick={() => onBorrowClick(asset)}
                    disabled={!isConnected}
                  >
                    Borrow
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export default Borrower;
