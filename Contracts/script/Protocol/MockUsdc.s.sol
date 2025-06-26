// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import {MockUSDC} from "../../src/Protocol/MockUSDC.sol";

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
//fuji - 0x5bdAE9570DA9803fE03B10a5c18ca3449754C23f
//sepoli - 0x770b9CcFe7a60FE269E055D5d6352DA6092Ad345