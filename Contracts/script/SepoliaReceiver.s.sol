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
        address router = 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59; // Chainlink CCIP Router on Sepolia
        address bridged = 0x10dfe187478df8CC056d65B359A4a9eb0c3A991F; // Replace with BridgedAVAX contract address

        // Deploy the SepoliaReceiver contract
        SepoliaReceiver sepoliaReceiver = new SepoliaReceiver(
            router,
            bridged
        );
        console.log("SepoliaReceiver deployed to:", address(sepoliaReceiver));

        // Stop broadcasting
        vm.stopBroadcast();
    }
}

//--- 0x9220e961229b24a91ee54AD1eB4AdA3e1846444c