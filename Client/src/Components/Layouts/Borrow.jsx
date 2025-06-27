import React from "react";

const Borrower = ({ assets, onBorrowClick, isConnected }) => (
  <div className="col-md-6 mb-4">
    <div className="glass-card p-4 h-100">
      <h4 className="text-center mb-4 fw-bold gradient-text">
        Assets to Borrow (Sepolia)
      </h4>
      <table className="table table-glass">
        <thead>
          <tr>
            <th>Asset</th>
            <th>Available</th>
            <th>APY</th>
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
              <td>{asset.apy}</td>
              <td>
                <button
                  className="btn btn-outline-primary btn-sm py-0"
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
);

export default Borrower;
