// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Script} from "forge-std/Script.sol";
import {console} from "forge-std/console.sol";
import "@chainlink/libraries/Client.sol";
import {SepoliaReceiver} from "../src/SepoliaReceiver.sol";
import {BridgedAVAX} from "../src/BridgedAVAX.sol";

// Test contract to expose _ccipReceive
contract TestSepoliaReceiver is SepoliaReceiver {
    constructor(
        address _router,
        address _bridged
    ) SepoliaReceiver(_router, _bridged) {}

    function callCCIPReceive(Client.Any2EVMMessage memory message) external {
        _ccipReceive(message);
    }
}

contract RunCCIPReceive is Script {
    function run() external {
        vm.startBroadcast();

        // Configuration
        address router = 0xD0daae2231E9CB96b94C8512223533293C3693Bf; // Sepolia CCIP Router
        address bridged = 0xba9709cc6C98bB34baa24BF62c28c18CE7bb26f2; // Replace with BridgedAVAX address
        address fujiBridge = 0x9E049662Cb15dd9e4668422f26e67Eb0eeD9a845; // Replace with FujiBridgeCCIP address
        address recipient = 0x14093F94E3D9E59D1519A9ca6aA207f88005918c; // From SparkSent event
        uint256 amount = 100000000000000000; // 0.1 AVAX from SparkSent event
        bytes32 messageId = 0x4832f67bc94fc7810e300e42280f0617541feaee0556373e3662e15ec486df47; // From SparkSent event

        // Create message matching FujiBridgeCCIP's sendSpark
        Client.Any2EVMMessage memory message = Client.Any2EVMMessage({
            messageId: messageId,
            sourceChainSelector: 14767456258918635008, // Fuji chain selector
            sender: abi.encode(fujiBridge), // Sender is FujiBridgeCCIP
            data: abi.encode(recipient, amount), // Encoded (address, uint256)
            destTokenAmounts: new Client.EVMTokenAmount[](0) // No token transfers
        });

        // Deploy test contract
        TestSepoliaReceiver testReceiver = new TestSepoliaReceiver(
            router,
            bridged
        );

        // Set fujiBridge in test contract
        testReceiver.setFujiBridge(fujiBridge);

        BridgedAVAX bridgedContract = BridgedAVAX(bridged);
        bridgedContract.setMinter(address(testReceiver));
        // Call _ccipReceive
        testReceiver.callCCIPReceive(message);

        console.log(
            "Called _ccipReceive on TestSepoliaReceiver at:",
            address(testReceiver)
        );

        vm.stopBroadcast();
    }
}
