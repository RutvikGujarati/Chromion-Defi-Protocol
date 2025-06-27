// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {CrossChainProtocol} from "../../src/Protocol/ProtocolSepolia.sol";

contract DeployCrossChainProtocol is Script {
    function run() external {
        // Start broadcasting transactions (private key and RPC URL provided via Forge command)
        vm.startBroadcast();

        // Configuration for sepolia testnet (Avalanche C-Chain testnet)
        address router = 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59; // Chainlink CCIP Router on sepolia
        address linkToken = 0x779877A7B0D9E8603169DdbD7836e478b4624789; // LINK token on sepolia
        // address MUSDC = 0x283aFB5Bf76369Cc9575439b8d149BeF7E4f355d; // Replace with USDC contract address
        // address USDCAggregator = 0xa2F78aB2355FE2F984D808b5CEe7FD0A93D4A637;
        // address AVAXAggregator = 0x5498BB86BC934c8D34FDA08E81D444153d0D06aD;
        // address ETHAggregator = 0x694AA1769357215DE4FAC081bf1f309aDC325306;

        // Deploy the CrossChainProtocol contract
        CrossChainProtocol sepoliaCCIPReceiver = new CrossChainProtocol(router,linkToken);
        console.log(
            "CrossChainProtocol deployed to:",
            address(sepoliaCCIPReceiver)
        );

        // Stop broadcasting
        vm.stopBroadcast();
    }
}
// --- 0x21BAaB08fc0454CB5Ab3F0e850ae2d573b903343
