import React from "react";
import { Routes, Route } from "react-router-dom";
import "@rainbow-me/rainbowkit/styles.css";
import { WagmiProvider, createConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { avalancheFuji, sepolia } from "wagmi/chains";
import { getDefaultWallets } from "@rainbow-me/rainbowkit";
import "./App.css";
import Header from "./Components/Header";
import Home from "./Components/Home";
import { BridgeProvider } from "./Context/BridgeContext";
import About from "./Components/About";
import { Web3Provider } from "./Context/Protocol";
import LendBorrow from "./Components/Layouts/LendBorrow";

const queryClient = new QueryClient();

const { connectors } = getDefaultWallets({
  appName: "Bridge-Protocol",
  projectId: "10c8edc95d61fa42b48ed61a93d22425", // Replace with your WalletConnect project ID
  chains: [sepolia, avalancheFuji],
  ssr: true,
});

const wagmiConfig = createConfig({
  chains: [sepolia, avalancheFuji],
  connectors,
});

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          coolMode
          initialChain={avalancheFuji}
          showRecentTransactions={true}
          theme={darkTheme({
            accentColor: "#f8f9fa",
            accentColorForeground: "#212529",
            borderRadius: "medium",
            overlayBlur: "small",
          })}
        >
          <>
            <Header />
            <Web3Provider>
              <BridgeProvider>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/Protocol" element={<LendBorrow />} />
                </Routes>
              </BridgeProvider>
            </Web3Provider>
          </>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
