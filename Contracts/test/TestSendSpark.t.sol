// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import {FujiBridgeCCIP} from "../src/fujiBridgeCCIP.sol";

contract TestSendSpark is Script {
    function run() external {
        FujiBridgeCCIP fujiBridge = FujiBridgeCCIP(
            payable(0xcD9B1E4e7cD72cc26a5164f1916C5A99b263b178)
        );
        address recipient = 0x14093F94E3D9E59D1519A9ca6aA207f88005918c;
        uint256 amount = 0.01 ether; // 0.1 AVAX

        vm.startBroadcast();
        fujiBridge.sendSpark{value: amount}(recipient, amount);
        vm.stopBroadcast();
    }
}
