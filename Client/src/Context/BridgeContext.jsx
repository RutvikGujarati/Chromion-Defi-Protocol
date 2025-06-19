import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import CONTRACT_ABI from "../BridgeABI.json";
import { FujiBridgeContract } from "../ContractAddress";

const BridgeContext = createContext();

export const BridgeProvider = ({ children }) => {
  const [contract, setContract] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successData, setSuccessData] = useState(null);

  useEffect(() => {
    const loadContract = async () => {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []); // ensure connected

        const signer = await provider.getSigner();
        const contractInstance = new ethers.Contract(
          FujiBridgeContract,
          CONTRACT_ABI,
          signer
        );

        setContract(contractInstance);
      }
    };

    loadContract();
  }, []);

  const sendSpark = async (recipient, amount) => {
    if (!contract) {
      console.error("Contract not loaded");
      return;
    }

    try {
      setIsLoading(true);
      const tx = await contract.sendSpark(
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
            return contract.interface.parseLog(log);
          } catch (e) {
            console.log(e);
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
        console.warn("SparkSent event not found in tx logs.");
      }
    } catch (err) {
      console.error("Bridge failed:", err);
      alert("Bridge failed. See console for details.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <BridgeContext.Provider
      value={{ sendSpark, isLoading, showSuccess, setShowSuccess, successData }}
    >
      {children}
    </BridgeContext.Provider>
  );
};

export const useBridge = () => useContext(BridgeContext);
