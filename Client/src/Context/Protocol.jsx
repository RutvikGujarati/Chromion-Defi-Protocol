import React, { createContext, useState, useEffect } from "react";
import { ethers } from "ethers";
import { useAccount, useChainId } from "wagmi";
import { useChainModal } from "@rainbow-me/rainbowkit";
import lenderAbi from "../ABI/LenderABI.json";
import protocolAbi from "../ABI/ProtocolReceiver.json";
import {
  LENDER_CONTRACT_ADDRESS,
  MUSDC_TOKEN_ADDRESS,
  PROTOCOL_CONTRACT_ADDRESS,
  USDC_TOKEN_ADDRESS,
} from "../ContractAddress";

const tokenAbi = [
  "function balanceOf(address account) view returns (uint256)",
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
];

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const { address, isConnected } = useAccount();
  const chain = useChainId();
  const { openChainModal } = useChainModal();

  const [provider, setProvider] = useState(null);
  const [lenderContract, setLenderContract] = useState(null);
  const [protocolContract, setProtocolContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [userSupplies, setUserSupplies] = useState([]);
  const [userBorrows, setUserBorrows] = useState([]);

  const FUJI_CHAIN_ID = 43113;
  const SEPOLIA_CHAIN_ID = 11155111;

  useEffect(() => {
    if (window.ethereum && isConnected) {
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethersProvider);

      const setupContracts = async () => {
        const signer = await ethersProvider.getSigner();
        setLenderContract(
          new ethers.Contract(LENDER_CONTRACT_ADDRESS, lenderAbi, signer)
        );
        setProtocolContract(
          new ethers.Contract(PROTOCOL_CONTRACT_ADDRESS, protocolAbi, signer)
        );
        setTokenContract(
          new ethers.Contract(USDC_TOKEN_ADDRESS, tokenAbi, signer)
        );
      };

      setupContracts();
    }
  }, [isConnected, chain]);

  useEffect(() => {
    const fetchSupplies = async () => {
      if (!isConnected || !lenderContract || !address) return;
      try {
        const deposit = await lenderContract.deposits(
          address,
          USDC_TOKEN_ADDRESS
        );
        const supplies = [];
        if (deposit > 0) {
          supplies.push({
            symbol: "USDC",
            balance: ethers.formatUnits(deposit, 6),
            apy: "10%",
            collateral: true,
            icon: "/usdc.png",
          });
        }
        setUserSupplies(supplies);
      } catch (error) {
        console.error("Error fetching supplies:", error);
      }
    };
    fetchSupplies();
  }, [isConnected, address, lenderContract, chain]);

  useEffect(() => {
    const fetchBorrows = async () => {
      if (!isConnected || !protocolContract || !address) return;
      try {
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
      } catch (error) {
        console.error("Error fetching borrows:", error);
      }
    };
    fetchBorrows();
  }, [isConnected, address, protocolContract, chain]);

  const deposit = async (tokenAddress, amount) => {
    if (!isConnected || !lenderContract)
      throw new Error("Connect wallet first");
    if (chain !== FUJI_CHAIN_ID) {
      openChainModal?.();
      throw new Error("Switch to Fuji");
    }
    const amountWei = ethers.parseUnits(amount.toString(), 6);
    const token = new ethers.Contract(
      USDC_TOKEN_ADDRESS,
      tokenAbi,
      await provider.getSigner()
    );
    const allowance = await token.allowance(address, LENDER_CONTRACT_ADDRESS);
    if (allowance < amountWei) {
      const approveTx = await token.approve(LENDER_CONTRACT_ADDRESS, amountWei);
      await approveTx.wait();
    }

    const tx = await lenderContract.deposit(tokenAddress, amountWei);
    await tx.wait();
    return tx;
  };
  const WithdrawToken = async (tokenAddress, amount) => {
    if (!isConnected || !lenderContract)
      throw new Error("Connect wallet first");
    if (chain !== FUJI_CHAIN_ID) {
      openChainModal?.();
      throw new Error("Switch to Fuji");
    }
    const amountWei = ethers.parseUnits(amount.toString(), 6);
    const tx = await lenderContract.withdraw(tokenAddress, amountWei);
    await tx.wait();
    return tx;
  };

  const borrow = async (tokenAddress, amount) => {
    if (!isConnected || !protocolContract)
      throw new Error("Connect wallet first");
    if (chain !== SEPOLIA_CHAIN_ID) {
      openChainModal?.();
      throw new Error("Switch to Sepolia");
    }
    const amountWei = ethers.parseUnits(amount.toString(), 6);
    const maxBorrow = await protocolContract.getMaxBorrow(
      address,
      tokenAddress
    );
    if (amountWei > maxBorrow) throw new Error("Amount exceeds limit");

    const tx = await protocolContract.borrow(tokenAddress, amountWei);
    await tx.wait();
    return tx;
  };

  const repay = async (tokenAddress, amount) => {
    if (!isConnected || !protocolContract)
      throw new Error("Connect wallet first");
    if (chain !== SEPOLIA_CHAIN_ID) {
      openChainModal?.();
      throw new Error("Switch to Sepolia");
    }
    const amountWei = ethers.parseUnits(amount.toString(), 6);

    const tx = await protocolContract.repay(tokenAddress, amountWei);
    await tx.wait();
    return tx;
  };

  const getMaxBorrowing = async (tokenAddress) => {
    if (!isConnected || !protocolContract) return "0";
    if (chain !== SEPOLIA_CHAIN_ID) {
      openChainModal?.();
      throw new Error("Switch to Sepolia");
    }
    const maxBorrow = await protocolContract.getMaxBorrow(
      address,
      tokenAddress
    );
    return ethers.formatUnits(maxBorrow, 6);
  };

  const getUserTokenInfo = async () => {
    if (!isConnected || !tokenContract) return { walletBalance: "0" };
    const walletBalance = await tokenContract.balanceOf(address);
    return { walletBalance: ethers.formatUnits(walletBalance, 6) };
  };

  return (
    <Web3Context.Provider
      value={{
        deposit,
        WithdrawToken,
        borrow,
        repay,
        getMaxBorrowing,
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
