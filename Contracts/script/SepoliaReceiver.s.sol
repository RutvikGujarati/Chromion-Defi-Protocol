// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {SepoliaReceiver} from "../src/SepoliaReceiver.sol";

contract DeploySepoliaReceiver is Script {
    function run() external {
        // Start broadcasting transactions (private key and RPC URL provided via Forge command)
        vm.startBroadcast();

        // Configuration for Sepolia testnet
        uint64 subscriptionId = 5062;
        address router = 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59; // Chainlink CCIP Router on Sepolia
        address linkToken = 0x779877A7B0D9E8603169DdbD7836e478b4624789; // LINK token on sepolia

        address bridged = 0xF69a804897F2D7acad303bBfa1dD7535DfaE86f6; // Replace with BridgedAVAX contract address

        // Deploy the SepoliaReceiver contract
        SepoliaReceiver sepoliaReceiver = new SepoliaReceiver(
            subscriptionId,
            router,
            bridged,
			linkToken
        );
        console.log("SepoliaReceiver deployed to:", address(sepoliaReceiver));

        // Stop broadcasting
        vm.stopBroadcast();
    }
}

//--- 0xAB00f25b9804780df0A878504669a6855f7641ad
