import React, { useState, useContext, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../Styles/Home.css";
import ParticlesBg from "../Animation/ParticlesBg";
import Modal from "react-bootstrap/Modal";
import { Web3Context } from "../Context/Protocol";
import { useChainModal } from "@rainbow-me/rainbowkit";

const LendBorrow = () => {
  const {
    isConnected,
    deposit,
    borrow,
    // repay,
    getMaxBorrow,
    getUserTokenInfo,
    userSupplies,
    userBorrows,
    chain,
    FUJI_CHAIN_ID,
    SEPOLIA_CHAIN_ID,
    USDC_TOKEN_ADDRESS,
    MUSDC_TOKEN_ADDRESS,
  } = useContext(Web3Context);
  const { openChainModal } = useChainModal();
  const [supplyAmount, setSupplyAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [maxBorrow, setMaxBorrow] = useState("0");
  const [tokenInfo, setTokenInfo] = useState({
    walletBalance: "0",
    depositedCollateral: "0",
  });

  const assetsToSupply = [
    {
      symbol: "USDC",
      balance: "0.1127659",
      apy: "10%",
      collateral: true,
      icon: "/usdc.png",
    },
  ];

  const assetsToBorrow = [
    {
      symbol: "mUSDC",
      available: "0.1127659",
      apy: "10%",
      icon: "/usdc.png",
    },
  ];

  // Fetch max borrow and token info when modal is opened
  useEffect(() => {
    const fetchData = async () => {
      if (isConnected && selectedAsset && showBorrowModal) {
        const max = await getMaxBorrow(MUSDC_TOKEN_ADDRESS);
        setMaxBorrow(max);
        const info = await getUserTokenInfo(MUSDC_TOKEN_ADDRESS);
        setTokenInfo(info);
      }
    };
    fetchData();
  }, [
    isConnected,
    selectedAsset,
    showBorrowModal,
    getMaxBorrow,
    getUserTokenInfo,
  ]);
console.log("token info",tokenInfo)
  const handleSupplyClick = (asset) => {
    if (isConnected) {
      if (chain !== FUJI_CHAIN_ID) {
        openChainModal?.();
        throw new Error("Please switch to Fuji to continue");
      } else {
        setSelectedAsset(asset);
        setSupplyAmount(asset.balance);
        setShowSupplyModal(true);
      }
    }
  };

  const handleBorrowClick = (asset) => {
    if (isConnected) {
      if (chain !== SEPOLIA_CHAIN_ID) {
        openChainModal?.();
        throw new Error("Please switch to Sepolia to continue");
      } else {
        setSelectedAsset(asset);
        setBorrowAmount("");
        setShowBorrowModal(true);
      }
    }
  };

  const handleSupplyConfirm = async () => {
    if (!isConnected || !selectedAsset) return;
    try {
      const tx = await deposit(USDC_TOKEN_ADDRESS, supplyAmount);
      await tx.wait();
      setShowSupplyModal(false);
      // Refresh user supplies
      const info = await getUserTokenInfo(MUSDC_TOKEN_ADDRESS);
      setTokenInfo(info);
    } catch (error) {
      console.error("Supply error:", error);
    }
  };

  const handleBorrowConfirm = async () => {
    if (!isConnected || !selectedAsset) return;
    try {
      const tx = await borrow(MUSDC_TOKEN_ADDRESS, borrowAmount);
      await tx.wait();
      setShowBorrowModal(false);
      // Refresh user borrows
      const info = await getUserTokenInfo(MUSDC_TOKEN_ADDRESS);
      setTokenInfo(info);
    } catch (error) {
      console.error("Borrow error:", error);
    }
  };

  const handleCloseSupplyModal = () => setShowSupplyModal(false);
  const handleCloseBorrowModal = () => setShowBorrowModal(false);

  return (
    <div className="position-relative overflow-hidden">
      <ParticlesBg />

      <div className="home-wrapper d-flex mt-5 justify-content-center align-items-center min-vh-100 text-light px-3">
        <div className="row w-100" style={{ maxWidth: "1100px" }}>
          {/* Your Supplies */}
          <div className="col-md-6 mb-4">
            <div className="glass-card p-4 h-100">
              <h4 className="text-center mb-4 fw-bold gradient-text">
                Your Supplies
              </h4>
              {userSupplies.length > 0 ? (
				<table className="table table-glass">
				<thead>
                    <tr>
                      <th>Asset</th>
                      <th>Balance</th>
                      <th>APY</th>
                      <th>Collateral</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userSupplies.map((asset) => (
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
          </div>

          {/* Your Borrows */}
          <div className="col-md-6 mb-4">
            <div className="glass-card p-4 h-100">
              <h4 className="text-center mb-4 fw-bold gradient-text">
                Your Borrows
              </h4>
              {userBorrows.length > 0 ? (
                <table className="table table-glass">
                  <thead>
                    <tr>
                      <th>Asset</th>
                      <th>Amount</th>
                      <th>APY</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userBorrows.map((asset) => (
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
                        <td>{asset.amount}</td>
                        <td>{asset.apy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <table className="table table-glass">
                  <tbody>
                    <tr>
                      <td className="text-center">Nothing borrowed yet</td>
                    </tr>
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Assets to Supply */}
          <div className="col-md-6 mb-4">
            <div className="glass-card p-4 h-100">
              <h4 className="text-center mb-4 fw-bold gradient-text">
                Assets to Supply (Fuji)
              </h4>
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
                  {assetsToSupply.map((asset) => (
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
                          className="btn btn-outline-primary btn-sm py-0"
                          onClick={() => handleSupplyClick(asset)}
                          disabled={!isConnected}
                        >
                          Supply
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Assets to Borrow */}
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
                  {assetsToBorrow.map((asset) => (
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
                          onClick={() => handleBorrowClick(asset)}
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
      </div>

      {/* Supply Modal */}
      <Modal show={showSupplyModal} onHide={handleCloseSupplyModal} centered>
        <Modal.Header
          closeButton
          className="bg-dark text-light border-secondary"
        >
          <Modal.Title>Supply {selectedAsset?.symbol}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light border-secondary">
          {chain !== FUJI_CHAIN_ID && (
            <div className="alert alert-warning">
              Network mismatch. Please switch to Avalanche Fuji.
            </div>
          )}
          <div className="mb-3">
            <label className="form-label">Amount</label>
            <input
              type="number"
              className="form-control bg-transparent border-secondary text-light"
              value={supplyAmount}
              onChange={(e) => setSupplyAmount(e.target.value)}
            />
            <small className="mt-1 d-block">
              Wallet Balance: {selectedAsset?.balance} MAX
            </small>
          </div>
          <div className="mt-3">
            <p>Supply APY: 10%</p>
            <p>Collateralization: Enabled</p>
          </div>
          <button
            className="btn btn-gradient w-100 mt-3 py-1"
            onClick={handleSupplyConfirm}
            disabled={chain !== FUJI_CHAIN_ID}
          >
            {chain !== FUJI_CHAIN_ID ? "Wrong Network" : "Confirm Supply"}
          </button>
        </Modal.Body>
      </Modal>

      {/* Borrow Modal */}
      <Modal show={showBorrowModal} onHide={handleCloseBorrowModal} centered>
        <Modal.Header
          closeButton
          className="bg-dark text-light border-secondary"
        >
          <Modal.Title>Borrow {selectedAsset?.symbol}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light border-secondary">
          {chain !== SEPOLIA_CHAIN_ID && (
            <div className="alert alert-warning">
              Network mismatch. Please switch to Ethereum Sepolia.
            </div>
          )}
          {tokenInfo.depositedCollateral === "0" && (
            <div className="alert alert-warning">
              No collateral deposited. Please supply assets first.
            </div>
          )}
          <div className="mb-3">
            <label className="form-label">Amount</label>
            <input
              type="number"
              className="form-control bg-transparent border-secondary text-light"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(e.target.value)}
            />
            <small className="mt-1 d-block">
              Available to borrow: {maxBorrow}
            </small>
          </div>
          <div className="mt-3">
            <p>Borrow APY: {selectedAsset?.apy}</p>
            <p>Collateral in use: {tokenInfo.depositedCollateral}</p>
          </div>
          <button
            className="btn btn-gradient w-100 mt-3 py-1"
            onClick={handleBorrowConfirm}
            disabled={
              chain !== SEPOLIA_CHAIN_ID ||
              tokenInfo.depositedCollateral === "0"
            }
          >
            Confirm Borrow
          </button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LendBorrow;
