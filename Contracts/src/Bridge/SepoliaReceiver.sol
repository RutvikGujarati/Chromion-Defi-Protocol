// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/applications/CCIPReceiver.sol";
import "@chainlink/interfaces/IRouterClient.sol";
import "@chainlink/libraries/Client.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@chainlink-shared/shared/interfaces/LinkTokenInterface.sol";
import "./BridgedAVAX.sol";

contract SepoliaReceiver is CCIPReceiver, Ownable {
    IRouterClient public immutable router;
    BridgedAVAX public immutable bridged;
    address public fujiBridge;
    uint64 public immutable subscriptionId;
    LinkTokenInterface public immutable linkToken;

    uint64 public constant FUJI_CHAIN_SELECTOR = 14767482510784806043;

    event FujiBridgeSet(address indexed fujiBridge);
    event BurnedAndRefundRequested(
        address indexed user,
        uint256 amount,
        bytes32 messageId
    );

    constructor(
        uint64 _subscriptionId,
        address _router,
        address _bridged,
        address _linkToken
    ) CCIPReceiver(_router) Ownable(msg.sender) {
        subscriptionId = _subscriptionId;
        router = IRouterClient(_router);
        bridged = BridgedAVAX(_bridged);
        linkToken = LinkTokenInterface(_linkToken);
        linkToken.approve(_router, type(uint256).max);
    }

    function setFujiBridge(address _fujiBridge) external onlyOwner {
        require(_fujiBridge != address(0), "Invalid address");
        fujiBridge = _fujiBridge;
        emit FujiBridgeSet(_fujiBridge);
    }

    /// Called by Chainlink CCIP router to mint bridged tokens
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

    /// Called by user to burn bAVAX and request refund in native AVAX on Fuji
    function burnAndRequestRefund(uint256 amount) external {
        bridged.burn(msg.sender, amount);

        Client.EVMTokenAmount[]
            memory tokenAmounts = new Client.EVMTokenAmount[](0);
        Client.EVM2AnyMessage memory msgStruct = Client.EVM2AnyMessage({
            receiver: abi.encode(fujiBridge),
            data: abi.encode(msg.sender, amount), // refund address + amount
            tokenAmounts: tokenAmounts,
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200000})
            ),
            feeToken: address(linkToken) // Use subscription billing
        });
        uint256 fee = router.getFee(FUJI_CHAIN_SELECTOR, msgStruct);
        require(
            linkToken.balanceOf(address(this)) >= fee,
            "Insufficient LINK for CCIP fee"
        );
        bytes32 messageId = IRouterClient(router).ccipSend(
            FUJI_CHAIN_SELECTOR,
            msgStruct
        );
        emit BurnedAndRefundRequested(msg.sender, amount, messageId);
    }
}
