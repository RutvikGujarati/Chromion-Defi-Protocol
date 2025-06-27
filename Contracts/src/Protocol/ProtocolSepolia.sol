// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IRouterClient} from "@chainlink/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/libraries/Client.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@chainlink/applications/CCIPReceiver.sol";
import "./Libraries/TokenManager.sol";
import "./Libraries/BorrowLogic.sol";

interface IMintableERC20 {
    function mint(address to, uint256 amount) external;
    function burn(uint256 amount) external;
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);
}

contract CrossChainProtocol is
    CCIPReceiver,
    ReentrancyGuard,
    Ownable,
    Pausable
{
    using SafeERC20 for IERC20;
    using TokenManager for TokenManager.TokenStorage;
    using BorrowLogic for BorrowLogic.BorrowStorage;

    IRouterClient public immutable router;
    IERC20 public immutable linkToken;
    uint64 public sourceChainSelector = 14767482510784806043; // Fuji
    address public lenderContract;

    TokenManager.TokenStorage private tokenStorage;
    BorrowLogic.BorrowStorage private BorrowStorage;
    enum ActionType { Deposit, Withdraw, DebtUpdate }

    event TokensReceived(
        bytes32 messageId,
        address sender,
        address sourceToken,
        address destinationToken,
        uint256 amount
    );
    event Borrowed(
        address indexed borrower,
        address indexed destinationToken,
        uint256 amount
    );
    event Repaid(
        address indexed borrower,
        address indexed destinationToken,
        uint256 amount
    );
    event DebtUpdateSent(bytes32 messageId, address user, bool hasDebt);

    constructor(
        address _router,
        address _linkToken
    ) CCIPReceiver(_router) Ownable(msg.sender) {
        require(_router != address(0), "Invalid router address");
        require(_linkToken != address(0), "Invalid LINK token address");
        router = IRouterClient(_router);
        linkToken = IERC20(_linkToken);
        linkToken.approve(_router, type(uint256).max);
    }

    // Token management functions
    function addToken(
        address _destinationToken,
        address _sourceToken,
        uint8 _decimals,
        bool _isBorrowable
    ) external onlyOwner {
        tokenStorage.addToken(
            _destinationToken,
            _sourceToken,
            _decimals,
            _isBorrowable
        );
    }

    function removeToken(address _destinationToken) external onlyOwner {
        tokenStorage.removeToken(_destinationToken);
    }

    function updateToken(
        address _destinationToken,
        address _sourceToken,
        bool _isBorrowable
    ) external onlyOwner {
        tokenStorage.updateToken(
            _destinationToken,
            _sourceToken,
            _isBorrowable
        );
    }

    // CCIP message handling
    function _ccipReceive(
        Client.Any2EVMMessage memory message
    ) internal override nonReentrant whenNotPaused {
        require(msg.sender == address(router), "Not from router");
        require(
            message.sourceChainSelector == sourceChainSelector,
            "Invalid Source Chain"
        );
        require(
            abi.decode(message.sender, (address)) == lenderContract,
            "Not from authorized lender"
        );

        (
            uint8 action,
            address user,
            address sourceToken,
            uint256 amount,
            uint8 decimals
        ) = abi.decode(message.data, (uint8, address, address, uint256, uint8));
        require(amount >= BorrowLogic.MIN_BORROW, "Amount below minimum");

        address destinationToken = tokenStorage.sourceToDestinationToken[
            sourceToken
        ];
        tokenStorage.validateToken(destinationToken, decimals);

        if (action == uint8(ActionType.Deposit)) {
            BorrowStorage.deposits[user][sourceToken] += amount;
            emit TokensReceived(
                message.messageId,
                user,
                sourceToken,
                destinationToken,
                amount
            );
        } else if (action == uint8(ActionType.Withdraw)) {
            require(
                BorrowStorage.deposits[user][sourceToken] >= amount,
                "Insufficient deposit"
            );
            BorrowStorage.deposits[user][sourceToken] -= amount;
            emit TokensReceived(
                message.messageId,
                user,
                sourceToken,
                destinationToken,
                amount
            );
        } else {
            revert("Unknown action type");
        }
    }

    // Borrow tokens
    function borrow(
        address _destinationToken,
        uint256 _amount
    ) external nonReentrant whenNotPaused {
        (uint256 current, uint256 interest) = BorrowStorage.validateBorrow(
            tokenStorage,
            _destinationToken,
            _amount,
            msg.sender
        );

        if (interest > 0) {
            BorrowStorage.borrowings[msg.sender][_destinationToken] =
                current +
                interest +
                _amount;
        } else {
            BorrowStorage.borrowings[msg.sender][_destinationToken] =
                current +
                _amount;
        }

        BorrowStorage.borrowTimestamps[msg.sender][_destinationToken] = block
            .timestamp;
        IMintableERC20(_destinationToken).mint(msg.sender, _amount);
        emit Borrowed(msg.sender, _destinationToken, _amount);
    }

    // Repay borrowed tokens
    function repay(
        address _destinationToken,
        uint256 _amount
    ) external nonReentrant whenNotPaused {
        uint256 interest = BorrowStorage.validateRepay(
            _destinationToken,
            _amount,
            msg.sender
        );
        if (interest > 0) {
            BorrowStorage.borrowings[msg.sender][_destinationToken] += interest;
        }

        BorrowStorage.borrowings[msg.sender][_destinationToken] -= _amount;
        BorrowStorage.borrowTimestamps[msg.sender][_destinationToken] = block
            .timestamp;

        IERC20(_destinationToken).safeTransferFrom(
            msg.sender,
            address(this),
            _amount
        );
        IMintableERC20(_destinationToken).burn(_amount);
        emit Repaid(msg.sender, _destinationToken, _amount);

        bool hasDebt = BorrowStorage.hasOutstandingDebt(
            tokenStorage,
            msg.sender
        );
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(lenderContract),
            data: abi.encode(uint8(ActionType.DebtUpdate), msg.sender, hasDebt),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200000})
            ),
            feeToken: address(linkToken)
        });

        uint256 fees = router.getFee(sourceChainSelector, message);
        require(
            linkToken.balanceOf(address(this)) >= fees,
            "Insufficient LINK for fees"
        );

        bytes32 messageId = router.ccipSend(sourceChainSelector, message);
        emit DebtUpdateSent(messageId, msg.sender, hasDebt);
    }

    // Admin and view functions
    function updateLenderContract(address _newLender) external onlyOwner {
        require(_newLender != address(0), "Invalid lender address");
        lenderContract = _newLender;
    }

    function getUserTokenInfo(
        address user,
        address destinationToken
    )
        external
        view
        returns (uint256 walletBalance, uint256 depositedCollateral)
    {
        require(
            tokenStorage.allowedTokens[destinationToken].isAllowed,
            "Token not allowed"
        );
        address sourceToken = tokenStorage
            .allowedTokens[destinationToken]
            .sourceToken;
        walletBalance = IERC20(destinationToken).balanceOf(user);
        depositedCollateral = BorrowStorage.deposits[user][sourceToken];
    }

    function getMaxBorrow(
        address _user,
        address _destinationToken
    ) external view returns (uint256) {
        return
            BorrowStorage.getMaxBorrow(tokenStorage, _user, _destinationToken);
    }

    function getCurrentDebt(
        address user,
        address token
    ) external view returns (uint256) {
        return
            BorrowStorage.borrowings[user][token] +
            BorrowStorage.accruedInterest(user, token);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
