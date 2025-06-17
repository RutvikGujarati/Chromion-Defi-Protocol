import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import WalletModal from "./WalletModal";
import "../Styles/Header.css";
import { ethers } from "ethers";

const Header = () => {
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletInfo, setWalletInfo] = useState({
    isConnected: false,
    address: "",
    balance: 0,
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const checkConnection = async () => {
      if (window.ethereum) {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          const address = await signer.getAddress();
          const balanceWei = await provider.getBalance(address);
          const balanceEth = ethers.formatEther(balanceWei);

          setWalletInfo({
            isConnected: true,
            address: `${address.slice(0, 6)}...${address.slice(-4)}`,
            balance: parseFloat(balanceEth).toFixed(4),
            fullAddress: address,
          });
        }
      }
    };
    checkConnection();
  }, []);

  const handleConnectWallet = async () => {
    if (walletInfo.isConnected) {
      // Disconnect wallet
      setWalletInfo({
        isConnected: false,
        address: "",
        balance: 0,
        fullAddress: "",
      });
      setShowWalletModal(false);
      setError("");
    } else {
      // Request MetaMask connection
      try {
        if (!window.ethereum) {
          setError(
            "MetaMask is not installed. Please install it to connect your wallet."
          );
          return;
        }

        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);

        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const balanceWei = await provider.getBalance(address);
        const balanceEth = ethers.formatEther(balanceWei);

        setWalletInfo({
          isConnected: true,
          address: `${address.slice(0, 6)}...${address.slice(-4)}`,
          balance: parseFloat(balanceEth).toFixed(4),
          fullAddress: address,
        });
        setShowWalletModal(true);
        setError("");
      } catch (err) {
        console.error("Wallet connection failed:", err);
        setError("Failed to connect to MetaMask. Please try again.");
      }
    }
  };

  return (
    <header className="header fixed-top">
      <div className="container d-flex align-items-center justify-content-between py-3">
        {/* Left side - DApp Name */}
        <div>
          <NavLink to="/" className="logo-link text-decoration-none">
            <span className="logo-text">NovaDapp</span>
          </NavLink>
        </div>

        {/* Center - Navigation Links */}
        <nav className="d-flex gap-4">
          <NavLink
            to="/"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            Home
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            About
          </NavLink>
        </nav>

        {/* Right side - Wallet Info */}
        <div className="d-flex align-items-center gap-3">
          {walletInfo.isConnected && (
            <span className="text-white small">{walletInfo.address}</span>
          )}
          <button
            className="wallet-button btn btn-outline-light"
            onClick={handleConnectWallet}
          >
            {walletInfo.isConnected ? "Disconnect Wallet" : "Connect Wallet"}
          </button>
        </div>

        {/* Wallet Modal */}
        {showWalletModal && (
          <WalletModal
            address={walletInfo.address}
            balance={walletInfo.balance}
            error={error}
            onClose={() => setShowWalletModal(false)}
          />
        )}
      </div>
    </header>
  );
};

export default Header;
