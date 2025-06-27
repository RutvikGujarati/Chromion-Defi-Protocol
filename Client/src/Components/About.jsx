import React from "react";

function About() {
  return (
    <div className="bg-dark text-white py-5 px-3 w-100 mt-5">
      <div className="container">
        <div className="p-4 p-md-5 rounded shadow border border-secondary">
          <h1 className="mb-4 text-center fw-bold">About NovaDapp</h1>
          <p className="lead">
            <strong>NovaDapp </strong> is a decentralized cross-chain bridge and
            lending-borrowing designed to transfer tokens between the{" "}
            <strong>Fuji testnet</strong> and{" "}
            <strong>Ethereum Sepolia testnet</strong>, utilizing{" "}
            <strong>
              Chainlink CCIP (Cross-Chain Interoperability Protocol)
            </strong>{" "}
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
            <li>
              • Uses Chainlink CCIP for secure cross-chain messaging (event
              sending).
            </li>
            <li>• Fully on-chain and permissionless.</li>
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

          {/* Lending and Borrowing Section */}
          <h4 className="mt-5 text-success">
            💰 Cross-Chain Lending & Borrowing
          </h4>
          <p>
            NovaDapp also features a basic cross-chain lending protocol that
            allows users to supply and borrow tokens across Fuji and Sepolia
            testnets.
          </p>
          <ul className="list-unstyled ms-3">
            <li>
              • Users can mint and supply <strong>mUSDC</strong> on Fuji.
            </li>
            <li>
              • Based on supplied collateral, users can borrow{" "}
              <strong>mUSDC</strong> on Sepolia.
            </li>
            <li>
              • Borrowing is capped at <strong>70%</strong> of the total supply
              amount (LTV ratio).
            </li>
            <li>
              • Currently, there's no interest logic — lending and borrowing
              follow a 1:1 static model.
            </li>
            <li>
              • All messages for borrowing and repayment are handled via
              Chainlink CCIP.
            </li>
          </ul>

          <h5 className="mt-4 text-warning">⚠️ Things to Note</h5>
          <ul className="list-unstyled ms-3">
            <li>
              • Real-time price feeds were considered but omitted due to testnet
              oracle availability issues.
            </li>
            <li>
              • Interest rate logic was initially added but removed for
              consistency and simplicity.
            </li>
            <li>
              • Deposits and borrowings are only simulated for testing, no real
              assets involved.
            </li>
          </ul>

          <p className="mt-3 fst-italic">
            This lending/borrowing module is ideal for testing cross-chain logic
            and user flows without worrying about complex DeFi mechanics.
          </p>
        </div>
      </div>
    </div>
  );
}

export default About;
