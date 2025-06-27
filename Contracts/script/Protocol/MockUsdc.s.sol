// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import {MockUSDC} from "../../src/Protocol/Token/MockUSDC.sol";

contract DeployMockUSDC is Script {
    function run() external {
        // Start broadcasting transactions
        vm.startBroadcast();

        // Deploy the mock usdc for lending an dborrowing
        MockUSDC usdc = new MockUSDC("USDC","mUSDC");
        console.log("usdc deployed to:", address(usdc));

        // Stop broadcasting
        vm.stopBroadcast();
    }
}
//fuji - 0x27eE91d6aA1E1EAa7F5bfe86069d4f97a3d7D752
//sepoli - 0x47E951BD25d2CC69C0264458E1da1C639f8751b4