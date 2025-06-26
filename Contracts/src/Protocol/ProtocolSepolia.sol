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

// Interface for the Mock USDC token
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

    IRouterClient public immutable router;
    uint64 public sourceChainSelector = 14767482510784806043; // Fuji
    address public lenderContract;
    address[] public allDestinationTokens; // Track allowed tokens

    struct TokenConfig {
        bool isAllowed;
        uint8 decimals;
        bool isBorrowable; // Can this token be borrowed?
        address sourceToken; // Corresponding token on source chain (Fuji)
    }

    mapping(address => TokenConfig) public allowedTokens; // destinationToken => config
    mapping(address => address) public sourceToDestinationToken; // sourceToken => destinationToken
    mapping(address => mapping(address => uint256)) public deposits; // user => sourceToken => amount
    mapping(address => mapping(address => uint256)) public borrowings; // user => destinationToken => amount
    // Tracks when the user last borrowed
    mapping(address => mapping(address => uint256)) public borrowTimestamps;
    uint256 public constant LOAN_TO_VALUE_RATIO = 70; // 70% LTV
    uint256 public constant MIN_BORROW = 1e6; // 6 decimals base
    uint256 public constant MAX_BORROW = 1e12 * 1e6; // 6 decimals base
    uint256 public constant BORROW_APY = 10e16; // 10% APY = 0.10 * 1e18

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
    event TokenAdded(
        address indexed destinationToken,
        address indexed sourceToken,
        uint8 decimals,
        bool isBorrowable
    );
    event TokenRemoved(address indexed destinationToken);
    event TokenUpdated(
        address indexed destinationToken,
        address sourceToken,
        bool isBorrowable
    );

    constructor(address _router) CCIPReceiver(_router) Ownable(msg.sender) {
        require(_router != address(0), "Invalid router address");

        router = IRouterClient(_router);
    }

    // Add a new token pair (source token on Fuji, destination token on Sepolia)
    function addToken(
        address _destinationToken,
        address _sourceToken,
        uint8 _decimals,
        bool _isBorrowable
    ) external onlyOwner {
        require(
            _destinationToken != address(0),
            "Invalid destination token address"
        );
        require(_sourceToken != address(0), "Invalid source token address");
        require(
            !allowedTokens[_destinationToken].isAllowed,
            "Destination token already allowed"
        );
        require(
            sourceToDestinationToken[_sourceToken] == address(0),
            "Source token already paired"
        );

        allowedTokens[_destinationToken] = TokenConfig({
            isAllowed: true,
            decimals: _decimals,
            isBorrowable: _isBorrowable,
            sourceToken: _sourceToken
        });
        sourceToDestinationToken[_sourceToken] = _destinationToken;
        allDestinationTokens.push(_destinationToken);
        emit TokenAdded(
            _destinationToken,
            _sourceToken,
            _decimals,
            _isBorrowable
        );
    }

    // Remove a token pair
    function removeToken(address _destinationToken) external onlyOwner {
        require(
            allowedTokens[_destinationToken].isAllowed,
            "Destination token not allowed"
        );
        address sourceToken = allowedTokens[_destinationToken].sourceToken;
        delete sourceToDestinationToken[sourceToken];
        delete allowedTokens[_destinationToken];
        emit TokenRemoved(_destinationToken);
    }

    // Update token configuration
    function updateToken(
        address _destinationToken,
        address _sourceToken,
        bool _isBorrowable
    ) external onlyOwner {
        require(
            allowedTokens[_destinationToken].isAllowed,
            "Destination token not allowed"
        );
        require(_sourceToken != address(0), "Invalid source token address");

        address oldSourceToken = allowedTokens[_destinationToken].sourceToken;
        if (oldSourceToken != _sourceToken) {
            delete sourceToDestinationToken[oldSourceToken];
            sourceToDestinationToken[_sourceToken] = _destinationToken;
        }

        allowedTokens[_destinationToken].sourceToken = _sourceToken;
        allowedTokens[_destinationToken].isBorrowable = _isBorrowable;
        emit TokenUpdated(_destinationToken, _sourceToken, _isBorrowable);
    }

    // Receive CCIP messagex
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

        // Decode message with action type
        (
            uint8 action,
            address user,
            address sourceToken,
            uint256 amount,
            uint8 decimals
        ) = abi.decode(message.data, (uint8, address, address, uint256, uint8));

        address destinationToken = sourceToDestinationToken[sourceToken];
        require(allowedTokens[destinationToken].isAllowed, "Token not allowed");
        require(amount >= MIN_BORROW, "Amount below minimum");
        require(
            decimals == allowedTokens[destinationToken].decimals,
            "Invalid decimals"
        );

        if (action == 0) {
            // Deposit
            deposits[user][sourceToken] += amount;
            emit TokensReceived(
                message.messageId,
                user,
                sourceToken,
                destinationToken,
                amount
            );
        } else if (action == 1) {
            // Withdraw
            require(
                deposits[user][sourceToken] >= amount,
                "Insufficient deposit"
            );
            deposits[user][sourceToken] -= amount;
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

    // Calculate max borrowable amount for a specific token (simplified without price feeds)
    function getMaxBorrow(
        address _user,
        address _destinationToken
    ) public view returns (uint256) {
        if (!allowedTokens[_destinationToken].isBorrowable) return 0;

        uint256 totalCollateral = 0;

        for (uint256 i = 0; i < allDestinationTokens.length; i++) {
            address destToken = allDestinationTokens[i];
            if (!allowedTokens[destToken].isAllowed) continue;

            address sourceToken = allowedTokens[destToken].sourceToken;
            uint256 collateralAmount = deposits[_user][sourceToken];
            if (collateralAmount == 0) continue;

            totalCollateral += collateralAmount;
        }

        uint256 maxBorrowable = (totalCollateral * LOAN_TO_VALUE_RATIO) / 100;

        // ✅ Subtract total borrowed across all borrowable tokens
        uint256 totalBorrowed = 0;
        for (uint256 i = 0; i < allDestinationTokens.length; i++) {
            address destToken = allDestinationTokens[i];
            if (!allowedTokens[destToken].isBorrowable) continue;

            totalBorrowed += borrowings[_user][destToken];
        }

        if (totalBorrowed >= maxBorrowable) return 0;

        return maxBorrowable - totalBorrowed;
    }

    // Borrow tokens
    function borrow(
        address _destinationToken,
        uint256 _amount
    ) external nonReentrant whenNotPaused {
        require(
            allowedTokens[_destinationToken].isBorrowable,
            "Token not borrowable"
        );
        require(_amount >= MIN_BORROW, "Borrow below minimum");
        require(_amount <= MAX_BORROW, "Borrow exceeds maximum");

        // Accrue interest before proceeding
        uint256 interest = _accruedInterest(msg.sender, _destinationToken);
        if (interest > 0) {
            borrowings[msg.sender][_destinationToken] += interest;
        }

        uint256 maxBorrow = getMaxBorrow(msg.sender, _destinationToken);
        require(
            borrowings[msg.sender][_destinationToken] + _amount <= maxBorrow,
            "Insufficient collateral"
        );

        borrowings[msg.sender][_destinationToken] += _amount;
        borrowTimestamps[msg.sender][_destinationToken] = block.timestamp;

        IMintableERC20(_destinationToken).mint(msg.sender, _amount);
        emit Borrowed(msg.sender, _destinationToken, _amount);
    }

    // Repay borrowed tokens
    function repay(
        address _destinationToken,
        uint256 _amount
    ) external nonReentrant whenNotPaused {
        require(_amount > 0, "Invalid repay amount");

        // Add any accrued interest before subtracting
        uint256 interest = _accruedInterest(msg.sender, _destinationToken);
        if (interest > 0) {
            borrowings[msg.sender][_destinationToken] += interest;
        }

        require(
            borrowings[msg.sender][_destinationToken] >= _amount,
            "Repay exceeds borrowed amount"
        );

        borrowings[msg.sender][_destinationToken] -= _amount;

        // Reset borrow timestamp to now (interest will accrue from this point again)
        borrowTimestamps[msg.sender][_destinationToken] = block.timestamp;

        IERC20(_destinationToken).safeTransferFrom(
            msg.sender,
            address(this),
            _amount
        );
        IMintableERC20(_destinationToken).burn(_amount);

        emit Repaid(msg.sender, _destinationToken, _amount);
    }

    // Admin functions
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
        require(allowedTokens[destinationToken].isAllowed, "Token not allowed");

        address sourceToken = allowedTokens[destinationToken].sourceToken;

        // Wallet balance of the destination token (on Sepolia)
        walletBalance = IERC20(destinationToken).balanceOf(user);

        // Deposited collateral (source token sent from Fuji)
        depositedCollateral = deposits[user][sourceToken];
    }
    function _accruedInterest(
        address user,
        address token
    ) internal view returns (uint256) {
        uint256 principal = borrowings[user][token];
        if (principal == 0 || borrowTimestamps[user][token] == 0) return 0;

        uint256 timeElapsed = block.timestamp - borrowTimestamps[user][token];
        uint256 interest = (principal * BORROW_APY * timeElapsed) /
            (365 days * 1e18);

        return interest;
    }
    function getCurrentDebt(
        address user,
        address token
    ) external view returns (uint256) {
        return borrowings[user][token] + _accruedInterest(user, token);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
