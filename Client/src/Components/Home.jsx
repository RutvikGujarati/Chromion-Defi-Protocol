import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";

const Home = () => {
  const [fromChain, setFromChain] = useState("Avalanche Fuji");
  const [toChain, setToChain] = useState("Ethereum Sepolia");
  const [amount, setAmount] = useState("");

  const handleSwap = () => {
    setFromChain(toChain);
    setToChain(fromChain);
  };

  const chains = ["Avalanche Fuji", "Ethereum Sepolia"];

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark text-light">
      <div
        className="card p-4"
        style={{
          maxWidth: "600px",
          background: "rgba(255, 255, 255, 0.1)",
          borderRadius: "16px",
          backdropFilter: "blur(15px)",
          WebkitBackdropFilter: "blur(15px)",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.37)",
          color: "white",
        }}
      >
        <h4 className="text-center mb-4">Bridge</h4>

        {/* Top Row: Input + From Chain */}
        <div className="row mb-3">
          <div className="col-md-5">
            <label className="form-label">Amount</label>
            <input
              type="number"
              className="form-control"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="col-md-7">
            <label className="form-label">From Chain</label>
            <select
              className="form-select"
              value={fromChain}
              onChange={(e) => setFromChain(e.target.value)}
            >
              {chains.map((chain) => (
                <option key={chain} value={chain}>
                  {chain}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Arrow */}
        <div className="d-flex justify-content-center my-3">
          <button
            className="btn border-0 shadow-sm d-flex align-items-center justify-content-center"
            onClick={handleSwap}
            title="Swap chains"
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4b6cb7, #182848)",
              color: "white",
              fontSize: "1.25rem",
              transition: "transform 0.3s ease",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "rotate(180deg)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = "rotate(0deg)")
            }
          >
            <i className="bi bi-arrow-left-right"></i>
          </button>
        </div>

        {/* Bottom Row: To Chain + Amount */}
        <div className="row mb-3">
          <div className="col-md-5 mb-3 mb-md-0">
            <label className="form-label">Receive Amount</label>
            <input
              type="number"
              className="form-control"
              placeholder="Expected amount"
            />
          </div>

          <div className="col-md-7">
            <label className="form-label">To Chain</label>
            <select
              className="form-select"
              value={toChain}
              onChange={(e) => setToChain(e.target.value)}
            >
              {chains.map((chain) => (
                <option key={chain} value={chain}>
                  {chain}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="d-grid">
          <button className="btn btn-primary">Bridge</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
