import React, { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount, useChainId } from "wagmi";
import { useChainModal } from "@rainbow-me/rainbowkit";
import lenderAbi from "../ABI/LenderABI.json";
import protocolAbi from "../ABI/ProtocolReceiver.json";

// Mock USDC and mUSDC ABI (simplified)
const tokenAbi = [
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const { address, isConnected } = useAccount();
  const chain = useChainId();
  console.log("current chain ", chain);
  const { openChainModal } = useChainModal();

  const [provider, setProvider] = useState(null);
  const [lenderContract, setLenderContract] = useState(null);
  const [protocolContract, setProtocolContract] = useState(null);
  const [userSupplies, setUserSupplies] = useState([]);
  const [userBorrows, setUserBorrows] = useState([]);

  // Contract addresses (replace with actual deployed addresses)
  const LENDER_CONTRACT_ADDRESS = "0xd099a2d442E629693094e7dc904Eae4aFca930Bc"; // Fuji
  const PROTOCOL_CONTRACT_ADDRESS =
    "0x44a515727E0E469C1A73e982273eF9825Ee1a292"; // Sepolia
  const USDC_TOKEN_ADDRESS = "0x32C167745271D5ade8861C6c941a5D48FbC6e44d"; // Fuji
  const MUSDC_TOKEN_ADDRESS = "0x69aFE4498108e278744c001925A9167FD12DEBb0"; // Sepolia

  // Chain IDs
  const FUJI_CHAIN_ID = 43113;
  const SEPOLIA_CHAIN_ID = 11155111;

  // Initialize contracts
  useEffect(() => {
    if (isConnected && window.ethereum) {
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethersProvider);

      const initContracts = async () => {
        const signer = await ethersProvider.getSigner();
        const lender = new ethers.Contract(
          LENDER_CONTRACT_ADDRESS,
          lenderAbi,
          signer
        );
        const protocol = new ethers.Contract(
          PROTOCOL_CONTRACT_ADDRESS,
          protocolAbi,
          signer
        );
        setLenderContract(lender);
        setProtocolContract(protocol);
      };

      initContracts();
    }
  }, [isConnected]);

  // Fetch user supplies and borrows
  useEffect(() => {
    const fetchUserData = async () => {
      if (!isConnected || !protocolContract || !lenderContract || !address)
        return;

      // Fetch supplies (deposits on Fuji)
      const usdcDeposit = await lenderContract.deposits(
        address,
        USDC_TOKEN_ADDRESS
      );
      const supplies = [];
      if (usdcDeposit > 0) {
        supplies.push({
          symbol: "USDC",
          balance: ethers.formatUnits(usdcDeposit, 6),
          apy: "10%",
          collateral: true,
          icon: "/usdc.png",
        });
      }
      setUserSupplies(supplies);

      // Fetch borrows (on Sepolia)
      const debt = await protocolContract.getCurrentDebt(
        address,
        MUSDC_TOKEN_ADDRESS
      );
      const borrows = [];
      if (debt > 0) {
        borrows.push({
          symbol: "mUSDC",
          amount: ethers.formatUnits(debt, 6),
          apy: "10%",
          icon: "/usdc.png",
        });
      }
      setUserBorrows(borrows);
    };

    fetchUserData();
  }, [isConnected, address, protocolContract, lenderContract]);

  // Deposit (Supply) function
  const deposit = async (tokenAddress, amount) => {
    if (!isConnected || !lenderContract)
      throw new Error("Not connected or contract not initialized");
    if (chain !== FUJI_CHAIN_ID) {
      openChainModal?.();
      throw new Error("Please switch to Fuji to continue");
    }

    const amountWei = ethers.parseUnits(amount.toString(), 6);
    const tx = await lenderContract.deposit(tokenAddress, amountWei);
    await tx.wait();
    return tx;
  };

  // Borrow function
  const borrow = async (tokenAddress, amount) => {
    if (!isConnected || !protocolContract) {
      throw new Error("Not connected or contract not initialized");
    }
    if (chain !== SEPOLIA_CHAIN_ID) {
      openChainModal?.();
      throw new Error("Please switch to Sepolia to continue");
    }

    const amountWei = ethers.parseUnits(amount.toString(), 6);
    const tokenContract = new ethers.Contract(
      MUSDC_TOKEN_ADDRESS,
      tokenAbi,
      await provider.getSigner()
    );
    const allowance = await tokenContract.allowance(
      address,
      PROTOCOL_CONTRACT_ADDRESS
    );
    if (allowance < amountWei) {
      const approveTx = await tokenContract.approve(
        PROTOCOL_CONTRACT_ADDRESS,
        amountWei
      );
      await approveTx.wait();
    }

    const tx = await protocolContract.borrow(tokenAddress, amountWei);
    await tx.wait();
    return tx;
  };

  // Repay function
  const repay = async (tokenAddress, amount) => {
    if (!isConnected || !protocolContract) {
      throw new Error("Not connected or contract not initialized");
    }
    if (chain !== SEPOLIA_CHAIN_ID) {
      openChainModal?.();
      throw new Error("Please switch to Sepolia to continue");
    }

    const amountWei = ethers.parseUnits(amount.toString(), 6);
    const tokenContract = new ethers.Contract(
      MUSDC_TOKEN_ADDRESS,
      tokenAbi,
      await provider.getSigner()
    );
    const allowance = await tokenContract.allowance(
      address,
      PROTOCOL_CONTRACT_ADDRESS
    );
    if (allowance < amountWei) {
      const approveTx = await tokenContract.approve(
        PROTOCOL_CONTRACT_ADDRESS,
        amountWei
      );
      await approveTx.wait();
    }

    const tx = await protocolContract.repay(tokenAddress, amountWei);
    await tx.wait();
    return tx;
  };

  // Get max borrowable amount
  const getMaxBorrow = async (tokenAddress) => {
    if (!isConnected || !protocolContract) return "0";
    if (chain !== SEPOLIA_CHAIN_ID) {
      openChainModal?.();
      throw new Error("Please switch to Sepolia to continue");
    }
    const maxBorrow = await protocolContract.getMaxBorrow(
      address,
      tokenAddress
    );
    return ethers.formatUnits(maxBorrow, 6);
  };

  // Get user token info
  const getUserTokenInfo = async (tokenAddress) => {
    if (!isConnected || !protocolContract)
      return { walletBalance: "0", depositedCollateral: "0" };
    if (chain !== SEPOLIA_CHAIN_ID) {
      openChainModal?.();
      throw new Error("Please switch to Sepolia to continue");
    }
    const [walletBalance, depositedCollateral] =
      await protocolContract.getUserTokenInfo(address, tokenAddress);
    return {
      walletBalance: ethers.formatUnits(walletBalance, 6),
      depositedCollateral: ethers.formatUnits(depositedCollateral, 6),
    };
  };

  return (
    <Web3Context.Provider
      value={{
        deposit,
        borrow,
        repay,
        getMaxBorrow,
        getUserTokenInfo,
        userSupplies,
        userBorrows,
        isConnected,
        chain,
        FUJI_CHAIN_ID,
        SEPOLIA_CHAIN_ID,
        USDC_TOKEN_ADDRESS,
        MUSDC_TOKEN_ADDRESS,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};
