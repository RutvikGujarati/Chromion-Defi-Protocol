// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/applications/CCIPReceiver.sol";
import "@chainlink/libraries/Client.sol";
import "./BridgedAVAX.sol";

contract SepoliaReceiver is CCIPReceiver {
    address public immutable router;
    BridgedAVAX public immutable bridged;

    constructor(address _router, address _bridged) CCIPReceiver(_router) {
        router = _router;
        bridged = BridgedAVAX(_bridged);
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory message // Use memory since _ccipReceive expects memory
    ) internal override {
        require(
            message.sourceChainSelector == 16015286601757825753,
            "Invalid Source Chain"
        );
        address sender = abi.decode(message.sender, (address)); // Decode bytes to address
        require(sender == address(this), "Invalid Sender");
        require(msg.sender == address(router), "Unauthorized sender");

        (address recipient, uint256 amount) = abi.decode(
            message.data,
            (address, uint256)
        );
        bridged.mint(recipient, amount);
    }
}
