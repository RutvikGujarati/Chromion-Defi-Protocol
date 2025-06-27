import React, { useState } from "react";

const YourSupplies = ({ supplies, onWithdraw }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleOpenModal = (asset) => {
    setSelectedAsset(asset);
    setWithdrawAmount(asset.balance);
    setShowModal(true);
  };

  const handleConfirmWithdraw = () => {
    if (selectedAsset && withdrawAmount) {
      onWithdraw(selectedAsset.tokenAddress, withdrawAmount);
      setShowModal(false);
      setWithdrawAmount("");
      setSelectedAsset(null);
    }
  };

  return (
    <div className="col-md-6 mb-4">
      <div className="glass-card p-4 h-100">
        <h4 className="text-center mb-4 fw-bold gradient-text">
          Your Supplies
        </h4>
        {supplies.length > 0 ? (
          <table className="table table-glass">
            <thead>
              <tr>
                <th>Asset</th>
                <th>Balance</th>
                <th>APY</th>
                <th>Collateral</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {supplies.map((asset) => (
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
                  <td>{asset.balance}</td>
                  <td>{asset.apy}</td>
                  <td>
                    {asset.collateral ? (
                      <i className="bi bi-check-lg text-success" />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleOpenModal(asset)}
                    >
                      Withdraw
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="table table-glass">
            <tbody>
              <tr>
                <td className="text-center">Nothing supplied yet</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content glass-card p-3">
              <div className="modal-header">
                <h5 className="modal-title">
                  Withdraw {selectedAsset?.symbol}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Amount</label>
                <input
                  type="number"
                  className="form-control"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  max={selectedAsset?.balance}
                />
                <div className="mt-2 text-muted">
                  Max: {selectedAsset?.balance} {selectedAsset?.symbol}
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleConfirmWithdraw}
                >
                  Confirm Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default YourSupplies;
