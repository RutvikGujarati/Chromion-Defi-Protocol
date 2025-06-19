// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/interfaces/IRouterClient.sol";
import "@chainlink/libraries/Client.sol";
import "@chainlink-shared/shared/interfaces/LinkTokenInterface.sol";

contract FujiBridgeCCIP {
    IRouterClient public immutable router;
    LinkTokenInterface public immutable linkToken;
    uint64 public constant SEP_CHAIN = 16015286601757825753; // Sepolia chain selector
    address public  sepoliaReceiver;
    uint64 public subscriptionId;

    event SparkSent(
        bytes32 indexed messageId,
        address indexed from,
        uint256 amount
    );
    event FeeEstimated(uint256 fee);

    constructor(
        uint64 _subscriptionId,
        address _router,
        address _linkToken,
        address _sepoliaReceiver
    ) {
        subscriptionId = _subscriptionId;
        router = IRouterClient(_router);
        linkToken = LinkTokenInterface(_linkToken);
        sepoliaReceiver = _sepoliaReceiver;

        // Approve router to spend LINK
        linkToken.approve(_router, type(uint256).max);
    }
    function setSepoliaReciever(address _sepoliaReceiver) external {
        require(_sepoliaReceiver != address(0), "Invalid address");
        sepoliaReceiver = _sepoliaReceiver;
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
            feeToken: address(linkToken) // Pay fees with LINK
        });

        // Estimate and log fee (in LINK)
        uint256 fee = router.getFee(SEP_CHAIN, msgStruct);
        emit FeeEstimated(fee);
        require(
            linkToken.balanceOf(address(this)) >= fee,
            "Insufficient LINK for fee"
        );

        // Send CCIP message
        bytes32 msgId = router.ccipSend(SEP_CHAIN, msgStruct);
        emit SparkSent(msgId, msg.sender, amount);
    }
}
