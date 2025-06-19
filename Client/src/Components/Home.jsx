import React, { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../Styles/Home.css"; // for custom styles
import { useAccount } from "wagmi";
import { useBridge } from "../Context/BridgeContext";

const Home = () => {
  const [fromChain, setFromChain] = useState("Avalanche Fuji");
  const [toChain, setToChain] = useState("Ethereum Sepolia");
  const [amount, setAmount] = useState("Probable Amount");
  const { address, isConnected } = useAccount();
  const chains = ["Avalanche Fuji", "Ethereum Sepolia"];
  const { sendSpark, isLoading, showSuccess, setShowSuccess, successData } =
    useBridge();

  const handleSwap = () => {
    setFromChain(toChain);
    setToChain(fromChain);
  };

  const handleBridge = () => {
    if (!address || !amount || isNaN(amount)) {
      alert("Invalid address or amount");
      return;
    }

    sendSpark(address, amount); // sends tokens to self; you can modify recipient
  };

  return (
    <div className="d-flex mt-5 justify-content-center align-items-center min-vh-100 bg-dark text-light px-3">
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
            <select className="form-select custom-select">
              <option>
                {fromChain === "Avalanche Fuji" ? "AVAX" : "WAVAX"}
              </option>
            </select>
          </div>
          <select
            className="form-select custom-select"
            value={fromChain}
            onChange={(e) => {
              const selectedChain = e.target.value;
              setFromChain(selectedChain);
              const otherChain = chains.find(
                (chain) => chain !== selectedChain
              );
              setToChain(otherChain);
            }}
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
            <select className="form-select custom-select">
              <option>{toChain === "Avalanche Fuji" ? "AVAX" : "WAVAX"}</option>
            </select>
          </div>
          <div className="input-group mb-3">
            <input
              type="text"
              className="form-control bg-transparent border-secondary text-light"
              placeholder="Probable Amount"
              value={`~ ${amount}`}
              disabled
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="text-center">
            Destination Address:{" "}
            <span className="text-info">
              {address ? `${address.slice(0, 6)}...${address.slice(-6)}` : ""}
            </span>
          </div>
        </div>

        <div className="d-grid">
          {!isConnected ? (
            <div className="text-center">Connect your wallet</div>
          ) : isLoading ? (
            <button
              className="btn btn-gradient text-white fw-semibold py-2 rounded-pill"
              disabled
            >
              Bridging...{" "}
              <span className="spinner-border spinner-border-sm ms-2"></span>
            </button>
          ) : (
            <button
              className="btn btn-gradient text-white fw-semibold py-2 rounded-pill"
              onClick={handleBridge}
            >
              Bridge
            </button>
          )}
        </div>
        {showSuccess && successData && (
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content bg-dark text-light">
                <div className="modal-header">
                  <h5 className="modal-title">WAVAX Sent Successfully!</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowSuccess(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  <p>
                    <strong>Message ID:</strong>
                    <br />
                    {successData.messageId}
                  </p>
                  <p>
                    <strong>From:</strong>
                    <br />
                    {successData.from}
                  </p>
                  <p>
                    <strong>Amount:</strong> {successData.amount} AVAX
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
