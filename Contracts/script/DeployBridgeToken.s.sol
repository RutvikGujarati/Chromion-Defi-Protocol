// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import {BridgedAVAX} from "../src/BridgedAVAX.sol";

contract DeployBridgedAVAX is Script {
    function run() external {
        // Start broadcasting transactions
        vm.startBroadcast();

        // Deploy the BridgedAVAX contract
        BridgedAVAX bridgedAVAX = new BridgedAVAX("WAVAX","WAVAX");
        console.log("BridgedAVAX deployed to:", address(bridgedAVAX));

        // Stop broadcasting
        vm.stopBroadcast();
    }
}
//sepolia - 0xF69a804897F2D7acad303bBfa1dD7535DfaE86f6