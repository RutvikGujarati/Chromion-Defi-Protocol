import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../Styles/Home.css"; // for custom styles
import { useAccount, useChainId } from "wagmi";
import { useChainModal } from "@rainbow-me/rainbowkit";
import { useBridge } from "../Context/BridgeContext";
import { ethers } from "ethers";
import { WAVAX_SEPOLIA_ADDRESS } from "../ContractAddress";
import metamask from "../assets/metamask-icon.png";
import ParticlesBg from "../Animation/ParticlesBg";

const Home = () => {
  const [fromChain, setFromChain] = useState("Avalanche Fuji");
  const [toChain, setToChain] = useState("Ethereum Sepolia");
  const [balance, setBalance] = useState(null);
  const [displayBalance, setDisplayBalance] = useState(null);
  const [amount, setAmount] = useState("Probable Amount");
  const { address, isConnected } = useAccount();
  const chains = ["Avalanche Fuji", "Ethereum Sepolia"];
  const chainId = useChainId();
  const { openChainModal } = useChainModal();
  const { sendSpark, isLoading, showSuccess, setShowSuccess, successData } =
    useBridge();
  const CHAIN_IDS = {
    "Avalanche Fuji": 43113,
    "Ethereum Sepolia": 11155111,
  };
  const wavaxAbi = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ];
  const requiredChainId = CHAIN_IDS[fromChain];
  const isWrongNetwork = chainId !== requiredChainId;

  const handleSwap = () => {
    setFromChain(toChain);
    setToChain(fromChain);
  };

  const handleBridge = () => {
    if (!address || !amount || isNaN(amount)) {
      alert("Invalid address or amount");
      return;
    }

    const chain = fromChain === "Ethereum Sepolia" ? "sepolia" : "fuji";

    sendSpark(address, amount, chain);
  };

  useEffect(() => {
    let isMounted = true;

    const loadBalance = async () => {
      if (!window.ethereum || !address) return;

      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();

        if (fromChain === "Ethereum Sepolia") {
          const wavaxContract = new ethers.Contract(
            WAVAX_SEPOLIA_ADDRESS,
            wavaxAbi,
            signer
          );
          const rawBalance = await wavaxContract.balanceOf(address);
          const formatted = ethers.formatEther(rawBalance);
          if (isMounted) {
            setBalance(formatted);
            setDisplayBalance(Number(formatted).toFixed(4));
          }
        } else {
          const rawBalance = await provider.getBalance(address);
          const formatted = ethers.formatEther(rawBalance);
          if (isMounted) {
            setBalance(formatted);
            setDisplayBalance(Number(formatted).toFixed(4));
          }
        }
      } catch (err) {
        console.error("Failed to fetch balance:", err);
        if (isMounted) {
          setBalance(null);
          setDisplayBalance(null);
        }
      }
    };

    loadBalance();

    // Re-fetch when chain/account changes, and re-check every 3s briefly after switch
    const interval = setInterval(() => {
      loadBalance();
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [address, fromChain, window.ethereum]);

  const WAVAX_TOKEN = {
    address: WAVAX_SEPOLIA_ADDRESS, // Replace with actual WAVAX contract address on Sepolia
    symbol: "WAVAX",
    decimals: 18,
    image: "https://cryptologos.cc/logos/avalanche-avax-logo.png", // Or your own hosted logo
  };

  const handleAddTokenToMetaMask = async () => {
    const SEPOLIA_CHAIN_ID = "0xaa36a7"; // Hex for 11155111

    try {
      // Step 1: Check current chain
      const currentChain = await window.ethereum.request({
        method: "eth_chainId",
      });

      // Step 2: If not on Sepolia, request a chain switch
      if (currentChain !== SEPOLIA_CHAIN_ID) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: SEPOLIA_CHAIN_ID }],
          });
        } catch (switchError) {
          console.error("Chain switch to Sepolia failed:", switchError);
          alert("Please switch to Ethereum Sepolia network in MetaMask.");
          return;
        }
      }

      // Step 3: Add the token
      const wasAdded = await window.ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: {
            address: WAVAX_TOKEN.address,
            symbol: WAVAX_TOKEN.symbol,
            decimals: WAVAX_TOKEN.decimals,
            image: WAVAX_TOKEN.image,
          },
        },
      });

      if (wasAdded) {
        console.log("WAVAX token added to wallet");
      } else {
        console.log("User declined token addition");
      }
    } catch (error) {
      console.error("Failed to add WAVAX:", error);
      alert("Unable to add token. Please try again.");
    }
  };

  return (
	<div className="position-relative overflow-hidden">
      <ParticlesBg /> {/* 👈 Particle background */}
    <div className="home-wrapper d-flex mt-5 justify-content-center align-items-center min-vh-100  text-light px-3">
      <div className="glass-card p-4 w-100" style={{ maxWidth: "600px" }}>
        <h4 className="text-center mb-4 fw-bold gradient-text">Bridge</h4>

        <div className="mb-4">
          <label className="form-label">Send</label>
          <div className="input-group mb-3 position-relative">
            <input
              type="number"
              className="form-control bg-transparent border-secondary text-light pe-5"
              placeholder={`Enter amount (${displayBalance ?? "..."})`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            {balance && (
              <button
                type="button"
                className="btn btn-sm text-info fw-semibold position-absolute end-0 top-50 translate-middle-y me-2 p-0 border-0 bg-transparent"
                style={{ fontSize: "0.8rem" }}
                onClick={() => setAmount(balance)}
              >
                Max
              </button>
            )}

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
              onChange={(e) => {
                const selectedChain = e.target.value;
                setToChain(selectedChain);
                const otherChain = chains.find(
                  (chain) => chain !== selectedChain
                );
                setFromChain(otherChain);
              }}
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
          ) : isWrongNetwork ? (
            <button
              className="btn btn-warning fw-semibold py-2 rounded-pill"
              onClick={openChainModal}
            >
              Switch Network to {fromChain}
            </button>
          ) : isLoading ? (
            <button
              className="btn btn-gradient text-white fw-semibold py-2 rounded-pill"
              disabled
            >
              Bridging...
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
          <div
            className="modal fade show d-block custom-dark-backdrop"
            tabIndex="-1"
            role="dialog"
          >
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content bg-dark text-light border border-secondary rounded shadow">
                <div className="modal-header border-secondary d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="modal-title mb-1">
                      ✅ Transaction Successful!
                    </h5>
                    <small className="text-secondary">
                      On CCIP, it may take time to complete the transaction. Use
                      the Message ID to track it&nbsp;
                      <a
                        href={`https://ccip.chain.link/#/side-drawer/msg/${successData.messageId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-info text-decoration-underline"
                      >
                        here
                      </a>
                      .
                    </small>
                  </div>
                  <button
                    type="button"
                    className="btn-close btn-close-white ms-3 mt-1"
                    onClick={() => setShowSuccess(false)}
                  ></button>
                </div>

                <div className="modal-body">
                  <p>
                    <strong>📦 Message ID:</strong>
                    <br />
                    {successData.messageId}
                  </p>
                  <p>
                    <strong>👤 From:</strong>
                    <br />
                    {successData.from}
                  </p>
                  <p>
                    <strong>💰 Amount:</strong> {successData.amount} AVAX
                  </p>
                </div>

                <div className="modal-footer border-secondary d-flex justify-content-center">
                  <button
                    className="btn btn-outline-light d-flex align-items-center gap-2"
                    onClick={handleAddTokenToMetaMask}
                  >
                    <img src={metamask} alt="MetaMask" width="20" height="20" />
                    Add WAVAX to MetaMask (Sepolia)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
	  </div>
    </div>
  );
};

export default Home;
