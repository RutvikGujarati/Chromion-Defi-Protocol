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
//sepolia - 0xba9709cc6C98bB34baa24BF62c28c18CE7bb26f2