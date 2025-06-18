import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../Styles/Home.css"; // for custom styles

const Home = () => {
  const [fromChain, setFromChain] = useState("Avalanche Fuji");
  const [toChain, setToChain] = useState("Ethereum Sepolia");
  const [amount, setAmount] = useState("");
  const [toAddress] = useState("0x14...918c"); // Display only

  const chains = ["Avalanche Fuji", "Ethereum Sepolia"];

  const handleSwap = () => {
    setFromChain(toChain);
    setToChain(fromChain);
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 bg-dark text-light px-3">
      <div className="glass-card p-4 w-100" style={{ maxWidth: "600px" }}>
        <h4 className="text-center mb-4 fw-bold gradient-text">Bridge</h4>

        <div className="mb-4">
          <label className="form-label">Send</label>
          <div className="input-group mb-3">
            <input
              type="number"
              className="form-control bg-transparent border-secondary text-light"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <select className="form-select custom-select" defaultValue="ETH">
              <option>ETH</option>
              <option>WETH</option>
            </select>
          </div>
          <select
            className="form-select custom-select "
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

        <div className="d-flex justify-content-center my-4">
          <button
            className="btn swap-btn rounded-circle d-flex align-items-center justify-content-center"
            onClick={handleSwap}
            title="Swap chains"
          >
            <i className="bi bi-arrow-left-right fs-4"></i>
          </button>
        </div>

        <div className="mb-4">
          <label className="form-label">To</label>
          <div className="input-group mb-3">
            <select
              className="form-select custom-select"
              value={toChain}
              onChange={(e) => setToChain(e.target.value)}
            >
              {chains.map((chain) => (
                <option key={chain} value={chain}>
                  {chain}
                </option>
              ))}
            </select>
            <select className="form-select custom-select" defaultValue="WETH">
              <option>WETH</option>
              <option>ETH</option>
            </select>
          </div>

          <div className="text-center">
            Destination Address: <span className="text-info">{toAddress}</span>
          </div>
        </div>

        <div className="d-grid">
          <button className="btn btn-gradient text-white fw-semibold py-2 rounded-pill">
            Bridge
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
