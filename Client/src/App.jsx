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

const queryClient = new QueryClient();

const { connectors } = getDefaultWallets({
  appName: "NovaDapp",
  projectId: "10c8edc95d61fa42b48ed61a93d22425", // Replace with your WalletConnect project ID
  chains: [sepolia, avalancheFuji],
});

const wagmiConfig = createConfig({
  chains: [sepolia, avalancheFuji],
  connectors,
});

function About() {
  return (
    <div className="main-content container mt-5 pt-5">
      <h1>About NovaDapp</h1>
      <p>This is the About page for our decentralized application.</p>
    </div>
  );
}

function App() {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#f8f9fa",
            accentColorForeground: "#212529",
            borderRadius: "medium",
            overlayBlur: "small",
          })}
        >
          <>
            <Header />
            <BridgeProvider>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </BridgeProvider>
          </>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default App;
