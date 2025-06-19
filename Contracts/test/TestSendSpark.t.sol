// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {FujiBridgeCCIP} from "../src/fujiBridgeCCIP.sol";

contract TestSendSpark is Script {
    function run() external {
        FujiBridgeCCIP fujiBridge = FujiBridgeCCIP(0x7DE15e71fE2B62C99F9c31E833CaB8ef87Fe216f);
        address recipient = 0x14093F94E3D9E59D1519A9ca6aA207f88005918c;
        uint256 amount = 0.01 ether; // 0.1 AVAX

        vm.startBroadcast();
        fujiBridge.sendSpark{value: amount}(recipient, amount);
        vm.stopBroadcast();
    }
}