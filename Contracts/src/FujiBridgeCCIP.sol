// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/interfaces/IRouterClient.sol";
import "@chainlink/applications/CCIPReceiver.sol";
import "@chainlink/libraries/Client.sol";
import "@chainlink-shared/shared/interfaces/LinkTokenInterface.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract FujiBridgeCCIP is CCIPReceiver, Ownable {
    LinkTokenInterface public immutable linkToken;
    IRouterClient public immutable router;

    uint64 public constant SEP_CHAIN = 16015286601757825753; // Sepolia chain selector
    address public sepoliaReceiver;
    uint64 public immutable subscriptionId;

    event SparkSent(
        bytes32 indexed messageId,
        address indexed from,
        uint256 amount
    );
    event Refunded(address indexed user, uint256 amount);

    constructor(
        address _sepoliaReceiver,
        address _linkToken,
        address _router,
        uint64 _subscriptionId
    ) CCIPReceiver(_router) Ownable(msg.sender) {
        router = IRouterClient(_router);
        sepoliaReceiver = _sepoliaReceiver;
        linkToken = LinkTokenInterface(_linkToken);
        subscriptionId = _subscriptionId;
        linkToken.approve(_router, type(uint256).max);
    }

    function setSepoliaReceiver(address _receiver) external onlyOwner {
        require(_receiver != address(0), "Invalid address");
        sepoliaReceiver = _receiver;
    }

    function sendSpark(address recipient, uint256 amount) external payable {
        require(msg.value == amount, "Amount mismatch");

        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](0);
        Client.EVM2AnyMessage memory msgStruct = Client.EVM2AnyMessage({
            receiver: abi.encode(sepoliaReceiver),
            data: abi.encode(recipient, amount),
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200000})
            ),
            feeToken: address(linkToken) // subscription billing
        });
        uint256 fee = router.getFee(SEP_CHAIN, msgStruct);
        require(
            linkToken.balanceOf(address(this)) >= fee,
            "Insufficient LINK for CCIP fee"
        );
        bytes32 msgId = router.ccipSend(SEP_CHAIN, msgStruct);
        emit SparkSent(msgId, msg.sender, amount);
    }

    /// Called by Chainlink router to refund user in native AVAX
    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override {
        require(
            message.sourceChainSelector == SEP_CHAIN,
            "Invalid Source Chain"
        );
        address sender = abi.decode(message.sender, (address));
        require(sender == sepoliaReceiver, "Invalid Sender");

        (address recipient, uint256 amount) = abi.decode(
            message.data,
            (address, uint256)
        );
        require(
            address(this).balance >= amount,
            "Insufficient AVAX in contract"
        );

        (bool sent, ) = payable(recipient).call{value: amount}("");
        require(sent, "AVAX transfer failed");

        emit Refunded(recipient, amount);
    }

    /// Allow contract to receive AVAX (for refunding)
    receive() external payable {}
}
