import React, { useState, useContext, useEffect } from "react";
import Modal from "react-bootstrap/Modal";
import { useChainModal } from "@rainbow-me/rainbowkit";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../Styles/Home.css";
import YourSupplies from "./YourSupplies";
import YourBorrows from "./YourBorrows";
import Lender from "./Lender";
import Borrower from "./Borrow";
import { Web3Context } from "../../Context/Protocol";
import ParticlesBg from "../../Animation/ParticlesBg";
import { MUSDC_TOKEN_ADDRESS, USDC_TOKEN_ADDRESS } from "../../ContractAddress";

const LendBorrow = () => {
  const {
    isConnected,
    deposit,
    WithdrawToken,
    repay,
    borrow,
    getMaxBorrowing,
    getUserTokenInfo,
    userSupplies,
    userBorrows,
    chain,
    FUJI_CHAIN_ID,
    SEPOLIA_CHAIN_ID,
  } = useContext(Web3Context);

  const { openChainModal } = useChainModal();

  const [supplyAmount, setSupplyAmount] = useState("");
  const [borrowAmount, setBorrowAmount] = useState("");
  const [showSupplyModal, setShowSupplyModal] = useState(false);
  const [showBorrowModal, setShowBorrowModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [maxBorrow, setMaxBorrow] = useState("0");
  const [walletBalance, setWalletBalance] = useState("0");

  useEffect(() => {
    const fetchBalance = async () => {
      if (isConnected) {
        const info = await getUserTokenInfo();
        setWalletBalance(info.walletBalance);
      }
    };
    fetchBalance();
  }, [isConnected, getUserTokenInfo]);

  useEffect(() => {
    const fetchData = async () => {
      if (isConnected && selectedAsset && showBorrowModal) {
        const max = await getMaxBorrowing(MUSDC_TOKEN_ADDRESS);
        setMaxBorrow(max);
      }
    };
    fetchData();
  }, [isConnected, selectedAsset, showBorrowModal]);

  const handleSupplyClick = (asset) => {
    if (!isConnected) return;
    if (chain !== FUJI_CHAIN_ID) return openChainModal?.();
    setSelectedAsset(asset);
    setSupplyAmount(walletBalance);
    setShowSupplyModal(true);
  };

  const handleBorrowClick = (asset) => {
    if (!isConnected) return;
    if (chain !== SEPOLIA_CHAIN_ID) return openChainModal?.();
    setSelectedAsset(asset);
    setBorrowAmount("");
    setShowBorrowModal(true);
  };

  const handleSupplyConfirm = async () => {
    try {
      const tx = await deposit(USDC_TOKEN_ADDRESS, supplyAmount);
      await tx.wait();
      setShowSupplyModal(false);
      const info = await getUserTokenInfo(USDC_TOKEN_ADDRESS);
      setWalletBalance(info.walletBalance);
    } catch (error) {
      console.error("Supply error:", error);
    }
  };

  const handleBorrowConfirm = async () => {
    try {
      const tx = await borrow(MUSDC_TOKEN_ADDRESS, borrowAmount);
      if (!tx) return; // Already handled inside `borrow`
      await tx.wait();
      setShowBorrowModal(false);
    } catch (error) {
      console.error("Borrow error:", error);
    }
  };

  const assetsToSupply = [
    {
      symbol: "USDC",
      balance: walletBalance,
      apy: "10%",
      collateral: true,
      icon: "/usdc.png",
    },
  ];

  const assetsToBorrow = [
    {
      symbol: "mUSDC",
      available: maxBorrow,
      apy: "10%",
      icon: "/usdc.png",
    },
  ];

  return (
    <div className="position-relative overflow-hidden">
      <ParticlesBg />
      <div className="home-wrapper d-flex mt-5 justify-content-center align-items-center min-vh-100 text-light px-3">
        <div className="row w-100" style={{ maxWidth: "1100px" }}>
          <YourSupplies
            supplies={userSupplies.map((s) => ({
              ...s,
              tokenAddress: USDC_TOKEN_ADDRESS, // or other token per asset
            }))}
            onWithdraw={async (tokenAddress, amount) => {
              try {
                const tx = await WithdrawToken(tokenAddress, amount);
                await tx.wait();
                alert("Withdraw successful");
              } catch (e) {
                console.error("Withdraw failed:", e);
                alert("Withdraw failed");
              }
            }}
          />

          <YourBorrows
            borrows={userBorrows.map((s) => ({
              ...s,
              tokenAddress: MUSDC_TOKEN_ADDRESS, // or other token per asset
            }))}
            onRepay={async (tokenAddress, amount) => {
              try {
                const tx = await repay(tokenAddress, amount);
                await tx.wait();
                alert("Repay successful");
              } catch (e) {
                console.error("Repay failed:", e);
                alert("Repay failed");
              }
            }}
          />
          <Lender
            assets={assetsToSupply}
            onSupplyClick={handleSupplyClick}
            isConnected={isConnected}
          />
          <Borrower
            assets={assetsToBorrow}
            onBorrowClick={handleBorrowClick}
            isConnected={isConnected}
          />
        </div>
      </div>

      {/* Supply Modal */}
      <Modal
        show={showSupplyModal}
        onHide={() => setShowSupplyModal(false)}
        centered
      >
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
              Wallet Balance: {walletBalance} MAX
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
      <Modal
        show={showBorrowModal}
        onHide={() => setShowBorrowModal(false)}
        centered
      >
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
          {parseFloat(maxBorrow) === 0 && (
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
          </div>
          <button
            className="btn btn-gradient w-100 mt-3 py-1"
            onClick={handleBorrowConfirm}
            disabled={chain !== SEPOLIA_CHAIN_ID || parseFloat(maxBorrow) === 0}
          >
            Confirm Borrow
          </button>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LendBorrow;
