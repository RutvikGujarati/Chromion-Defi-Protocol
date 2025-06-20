import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import FUJI_ABI from "../ABI/BridgeABI.json";
import SEPOLIA_ABI from "../ABI/SepoliaReceiverABI.json";
import {
  FujiBridgeContract,
  SepoliaReceiverContract,
} from "../ContractAddress";

const BridgeContext = createContext();

export const BridgeProvider = ({ children }) => {
  const [fujiContract, setFujiContract] = useState(null);
  const [sepoliaContract, setSepoliaContract] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  // Common contract loader
  const loadContracts = async () => {
    if (typeof window.ethereum !== "undefined") {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      await browserProvider.send("eth_requestAccounts", []);
      const signerInstance = await browserProvider.getSigner();

      const fuji = new ethers.Contract(
        FujiBridgeContract,
        FUJI_ABI,
        signerInstance
      );
      const sepolia = new ethers.Contract(
        SepoliaReceiverContract,
        SEPOLIA_ABI,
        signerInstance
      );

      setProvider(browserProvider);
      setSigner(signerInstance);
      setFujiContract(fuji);
      setSepoliaContract(sepolia);
    } else {
      console.error("Ethereum provider not found");
    }
  };

  useEffect(() => {
    loadContracts();
  }, []);

  // 🚀 sendSpark supports Sepolia or Fuji based on chain
  const sendSpark = async (recipient, amount, targetChain = "fuji") => {
    try {
      setIsLoading(true);

      if (targetChain === "sepolia") {
        if (!sepoliaContract) {
          console.error("Sepolia contract not loaded");
          return;
        }

        const tx = await sepoliaContract.burnAndRequestRefund(
          ethers.parseEther(amount.toString())
        );
        const receipt = await tx.wait();

        const refundEvent = receipt.logs
          .map((log) => {
            try {
              return sepoliaContract.interface.parseLog(log);
            } catch {
              return null;
            }
          })
          .find((e) => e && e.name === "BurnedAndRefundRequested");

        if (refundEvent) {
          const { messageId, user, amount } = refundEvent.args;
          setSuccessData({
            messageId,
            from: user,
            amount: ethers.formatEther(amount.toString()),
          });
          setShowSuccess(true);
        } else {
          console.warn("BurnedAndRefundRequested event not found");
        }
      } else {
        if (!fujiContract) {
          console.error("Fuji contract not loaded");
          return;
        }

        const tx = await fujiContract.sendSpark(
          recipient,
          ethers.parseEther(amount.toString()),
          {
            value: ethers.parseEther(amount.toString()),
          }
        );
        const receipt = await tx.wait();

        const sparkSentEvent = receipt.logs
          .map((log) => {
            try {
              return fujiContract.interface.parseLog(log);
            } catch {
              return null;
            }
          })
          .find((e) => e && e.name === "SparkSent");

        if (sparkSentEvent) {
          const { messageId, from, amount } = sparkSentEvent.args;
          setSuccessData({
            messageId,
            from,
            amount: ethers.formatEther(amount.toString()),
          });
          setShowSuccess(true);
        } else {
          console.warn("SparkSent event not found");
        }
      }
    } catch (err) {
      console.error("sendSpark failed:", err);
      alert("Bridge failed. See console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BridgeContext.Provider
      value={{
        provider,
        signer,
        sendSpark,
        isLoading,
        showSuccess,
        setShowSuccess,
        successData,
      }}
    >
      {children}
    </BridgeContext.Provider>
  );
};

export const useBridge = () => useContext(BridgeContext);
