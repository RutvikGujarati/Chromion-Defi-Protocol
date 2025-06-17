import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const WalletModal = ({ address, balance, onClose }) => {
  return (
    <div
      className="position-fixed top-50 start-50 translate-middle w-100 h-100 d-flex align-items-center justify-content-center"
      style={{
        backdropFilter: "blur(8px)",
        backgroundColor: "rgba(0,0,0,0.4)",
        zIndex: 1050,
      }}
    >
      <div
        className="card text-white p-4"
        style={{
          width: "100%",
          maxWidth: "400px",
          background: "rgba(255, 255, 255, 0.05)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          borderRadius: "20px",
          backdropFilter: "blur(15px)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.37)",
        }}
      >
        <div className="card-body">
          <h5 className="card-title mb-4 text-center">🔐 Wallet Details</h5>
          <p className="card-text mb-2">
            <strong>Address:</strong>
            <br />
            <small className="text-light">{address}</small>
          </p>
          <p className="card-text mb-4">
            <strong>Balance:</strong> {balance} ETH
          </p>
          <div className="d-grid">
            <button className="btn btn-outline-light" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletModal;
