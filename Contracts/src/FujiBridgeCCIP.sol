// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/interfaces/IRouterClient.sol";
import "@chainlink/libraries/Client.sol";
import "@chainlink-shared/shared/interfaces/LinkTokenInterface.sol";

contract FujiBridgeCCIP {
    IRouterClient public immutable router;
    LinkTokenInterface public immutable linkToken;
    uint64 public constant SEP_CHAIN = 16015286601757825753;
    address public immutable sepoliaReceiver;
    uint64 public subscriptionId;

    event SparkSent(
        bytes32 indexed messageId,
        address indexed from,
        uint256 amount
    );

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

        // Optional: approve router to use LINK
        linkToken.approve(_router, type(uint256).max);
    }
    function sendSpark(address recipient, uint256 amount) external payable {
        require(msg.value == amount, "Amount mismatch");

        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](0); // Empty array for no token transfers

        Client.EVM2AnyMessage memory msgStruct = Client.EVM2AnyMessage({
            receiver: abi.encode(sepoliaReceiver),
            data: abi.encode(recipient, amount),
            tokenAmounts: tokenAmounts, // Use the array here
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200000})
            ),
            feeToken: address(linkToken)
        });

        bytes32 msgId = router.ccipSend(SEP_CHAIN, msgStruct);
        emit SparkSent(msgId, msg.sender, amount);
    }
}
