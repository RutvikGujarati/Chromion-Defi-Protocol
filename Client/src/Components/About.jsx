import React from "react";

function About() {
  return (
    <div className="bg-dark text-white py-5 px-3 w-100 mt-5">
      <div className="container">
        <div className="p-4 p-md-5 rounded shadow border border-secondary">
          <h1 className="mb-4 text-center fw-bold">About NovaDapp Bridge</h1>
          <p className="lead">
            <strong>NovaDapp Bridge</strong> is a decentralized cross-chain
            bridge designed to transfer native AVAX seamlessly between the{" "}
            <strong>Fuji testnet</strong> and{" "}
            <strong>Ethereum Sepolia testnet</strong>, utilizing{" "}
            <strong>
              Chainlink CCIP (Cross-Chain Interoperability Protocol)
            </strong>
            for secure and reliable message passing.
          </p>

          <h4 className="mt-4 text-info">🔁 1:1 Bridging Mechanism</h4>
          <ul className="list-unstyled ms-3">
            <li>• Users deposit native AVAX on Fuji.</li>
            <li>
              • An equal amount of <strong>bAVAX</strong> (bridged AVAX) is
              minted on Sepolia.
            </li>
            <li>
              • When bAVAX is burned on Sepolia, the original AVAX is refunded
              back on Fuji.
            </li>
          </ul>

          <h4 className="mt-4 text-info">⚙️ Technical Details</h4>
          <ul className="list-unstyled ms-3">
            <li>• Uses Chainlink CCIP for secure cross-chain messaging(event sending).</li>
            <li>• Fully on-chain, and permissionless.</li>
            <li>
              • Refunds and token burns are handled with a 1:1 ratio logic.
            </li>
          </ul>

          <h4 className="mt-4 text-info">📌 Concerns</h4>
          <ul className="list-unstyled ms-3">
            <li>
              • LINK tokens are required for CCIP fee payments on both chains.
            </li>
            <li>
              • AVAX must be sent with the exact value as specified to avoid
              rejection.
            </li>
            <li>
              • Ensure correct wallet connections on both Fuji and Sepolia
              testnets.
            </li>
          </ul>

          <p className="mt-4 fst-italic">
            Note: This bridge is currently deployed on testnets for development
            and demonstration purposes. Mainnet support may be added in future
            versions.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
