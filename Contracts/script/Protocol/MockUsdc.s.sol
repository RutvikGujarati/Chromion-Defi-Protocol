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
//fuji - 0x2B87F21e0302bB4D42197BeD902d310C385C6972
//sepoli - 0xfe74510FD401Fb37b47CE4761ED3977f0Da17e12