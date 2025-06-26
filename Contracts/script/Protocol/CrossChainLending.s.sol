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
        address sepoliaReceiver = 0x4FD7A5EA79fdB14fF25088F5065CC59D40cE8992; // Replace with SepoliaReceiver contract address

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
// --- 0x95a0BDbFEeE6179491d7318db3c1D40bc374d56a
