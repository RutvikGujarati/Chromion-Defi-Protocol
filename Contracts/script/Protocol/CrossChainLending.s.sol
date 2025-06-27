// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {CrossChainLender} from "../../src/Protocol/CrossChainLendingProtocol.sol";

contract DeployFujiLending is Script {
    function run() external {
        // Start broadcasting transactions (private key and RPC URL provided via Forge command)
        vm.startBroadcast();

        // Configuration for Fuji testnet (Avalanche C-Chain testnet)
        address router = 0xF694E193200268f9a4868e4Aa017A0118C9a8177; // Chainlink CCIP Router on Fuji
        address linkToken = 0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846; // LINK token on Fuji
        address sepoliaReceiver = 0x4D7E927aB6a5891eBB5C05Ce0050ce4Ff66E5fbA; // Replace with SepoliaReceiver contract address

        // Deploy the CrossChainLender contract
        CrossChainLender fujiCCIPLender = new CrossChainLender(
            router,
            linkToken,
            sepoliaReceiver
        );
        console.log("CrossChainLender deployed to:", address(fujiCCIPLender));

        // Stop broadcasting
        vm.stopBroadcast();
    }
}
// --- 0xf955b31F8c2c0f21bfC4EE1Cff718eb2fdc7cF6D
