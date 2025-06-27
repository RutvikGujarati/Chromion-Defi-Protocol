// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {FujiBridgeCCIP} from "../../src/Bridge/FujiBridgeCCIP.sol";

contract DeployFujiBridgeCCIP is Script {
    function run() external {
        // Start broadcasting transactions (private key and RPC URL provided via Forge command)
        vm.startBroadcast();

        // Configuration for Fuji testnet (Avalanche C-Chain testnet)
        uint64 subscriptionId = 15612; // Replace with your Chainlink CCIP subscription ID
        address router = 0xF694E193200268f9a4868e4Aa017A0118C9a8177; // Chainlink CCIP Router on Fuji
        address linkToken = 0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846; // LINK token on Fuji
        address sepoliaReceiver = 0x33AA98BC693f8772A1D63320A85BB95CF8bA8fa5; // Replace with SepoliaReceiver contract address

        // Deploy the FujiBridgeCCIP contract
        FujiBridgeCCIP fujiBridge = new FujiBridgeCCIP(
            sepoliaReceiver,
            linkToken,
            router,
            subscriptionId
        );
        console.log("FujiBridgeCCIP deployed to:", address(fujiBridge));

        // Stop broadcasting
        vm.stopBroadcast();
    }
}
// --- 0x548cbe9B84Dc056015B6212F7Ecd8BD64290CC4C
