// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/applications/CCIPReceiver.sol";
import "@chainlink/libraries/Client.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./BridgedAVAX.sol";

contract SepoliaReceiver is CCIPReceiver, Ownable {
    address public immutable router;
    BridgedAVAX public immutable bridged;
    address public fujiBridge;

    uint64 public constant FUJI_CHAIN_SELECTOR = 14767482510784806043;

    event FujiBridgeSet(address indexed fujiBridge);

    constructor(
        address _router,
        address _bridged
    ) CCIPReceiver(_router) Ownable(msg.sender) {
        router = _router;
        bridged = BridgedAVAX(_bridged);
    }

    function setFujiBridge(address _fujiBridge) external onlyOwner {
        require(_fujiBridge != address(0), "Invalid address");
        fujiBridge = _fujiBridge;
        emit FujiBridgeSet(_fujiBridge);
    }

    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        require(
            message.sourceChainSelector == FUJI_CHAIN_SELECTOR,
            "Invalid Source Chain"
        );
        require(fujiBridge != address(0), "FujiBridge not set");
        address sender = abi.decode(message.sender, (address));
        require(sender == fujiBridge, "Invalid Sender");

        (address recipient, uint256 amount) = abi.decode(
            message.data,
            (address, uint256)
        );
        bridged.mint(recipient, amount);
    }
}
