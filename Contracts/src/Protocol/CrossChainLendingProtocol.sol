// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IRouterClient} from "@chainlink/interfaces/IRouterClient.sol";
import {Client} from "@chainlink/libraries/Client.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {AggregatorV3Interface} from "@chainlink-shared/shared/interfaces/AggregatorV3Interface.sol";

// Sender contract on Avalanche Fuji
contract CrossChainLender is ReentrancyGuard, Ownable, Pausable {
    using SafeERC20 for IERC20;

    IRouterClient public immutable router;
    IERC20 public immutable linkToken;
    uint64 public destinationChainSelector = 16015286601757825753; // Sepolia
    address public protocolContract; // Protocol contract on Sepolia

    struct TokenConfig {
        bool isAllowed;
        uint8 decimals;
    }
    enum ActionType {
        Deposit,
        Withdraw
    }
    mapping(address => TokenConfig) public allowedTokens; // Allowed deposit tokens
    mapping(address => mapping(address => uint256)) public deposits; // user => token => amount
    uint256 public constant MIN_DEPOSIT = 1e6; // Minimum deposit (6 decimals base)
    uint256 public constant MAX_DEPOSIT = 1e12 * 1e6; // Maximum deposit

    event DepositMade(
        address indexed user,
        address indexed token,
        uint256 amount,
        bytes32 messageId
    );
    event MessageSent(
        bytes32 messageId,
        address receiver,
        address token,
        uint256 amount
    );
    event EmergencyWithdraw(
        address indexed user,
        address indexed token,
        uint256 amount
    );
    event TokenAdded(address indexed token, uint8 decimals);
    event TokenRemoved(address indexed token);
    event LinkWithdrawn(address indexed to, uint256 amount);

    constructor(
        address _router,
        address _linkToken,
        address _protocolContract
    ) Ownable(msg.sender) {
        require(_router != address(0), "Invalid router address");
        require(_linkToken != address(0), "Invalid LINK token address");
        require(_protocolContract != address(0), "Invalid protocol address");

        router = IRouterClient(_router);
        linkToken = IERC20(_linkToken);
        protocolContract = _protocolContract;
        linkToken.approve(_router, type(uint256).max);
    }

    // Add a new allowed deposit token
    function addToken(address _token, uint8 _decimals) external onlyOwner {
        require(_token != address(0), "Invalid token address");
        require(!allowedTokens[_token].isAllowed, "Token already allowed");
        allowedTokens[_token] = TokenConfig({
            isAllowed: true,
            decimals: _decimals
        });
        emit TokenAdded(_token, _decimals);
    }

    // Remove an allowed deposit token
    function removeToken(address _token) external onlyOwner {
        require(allowedTokens[_token].isAllowed, "Token not allowed");
        delete allowedTokens[_token];
        emit TokenRemoved(_token);
    }

    // Deposit tokens as collateral
    function deposit(
        address _token,
        uint256 _amount
    ) external nonReentrant whenNotPaused {
        TokenConfig memory tokenConfig = allowedTokens[_token];
        require(tokenConfig.isAllowed, "Token not allowed");
        require(_amount >= MIN_DEPOSIT, "Deposit below minimum");
        require(_amount <= MAX_DEPOSIT, "Deposit exceeds maximum");
        require(
            deposits[msg.sender][_token] + _amount <= MAX_DEPOSIT,
            "Total deposit exceeds maximum"
        );

        // Transfer tokens from user to contract
        IERC20(_token).safeTransferFrom(msg.sender, address(this), _amount);
        deposits[msg.sender][_token] += _amount;

        // Prepare CCIP message
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(protocolContract),
            data: abi.encode(
                uint8(ActionType.Deposit),
                msg.sender,
                _token,
                _amount,
                tokenConfig.decimals
            ),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 400000})
            ),
            feeToken: address(linkToken)
        });

        // Calculate and check CCIP fees
        uint256 fees = router.getFee(destinationChainSelector, message);
        require(
            linkToken.balanceOf(address(this)) >= fees,
            "Insufficient LINK for fees"
        );

        // Send CCIP message
        bytes32 messageId = router.ccipSend(destinationChainSelector, message);
        emit DepositMade(msg.sender, _token, _amount, messageId);
        emit MessageSent(messageId, protocolContract, _token, _amount);
    }

    function withdraw(
        address _token,
        uint256 _amount
    ) external nonReentrant whenNotPaused {
        TokenConfig memory tokenConfig = allowedTokens[_token];
        require(tokenConfig.isAllowed, "Token not allowed");
        require(_amount > 0, "Amount must be greater than zero");
        require(
            deposits[msg.sender][_token] >= _amount,
            "Insufficient balance"
        );

        deposits[msg.sender][_token] -= _amount;
        IERC20(_token).safeTransfer(msg.sender, _amount);

        // Prepare CCIP message to notify protocol of withdrawal
        Client.EVM2AnyMessage memory message = Client.EVM2AnyMessage({
            receiver: abi.encode(protocolContract),
            data: abi.encode(
                uint8(ActionType.Withdraw),
                msg.sender,
                _token,
                _amount,
                tokenConfig.decimals
            ),
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 200_000})
            ),
            feeToken: address(linkToken)
        });

        // Calculate CCIP fees
        uint256 fees = router.getFee(destinationChainSelector, message);
        require(
            linkToken.balanceOf(address(this)) >= fees,
            "Insufficient LINK"
        );

        bytes32 messageId = router.ccipSend(destinationChainSelector, message);

        emit MessageSent(messageId, protocolContract, _token, _amount);
    }

    // Withdraw LINK tokens (for admin)
    function withdrawLink(address _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "Invalid address");
        linkToken.safeTransfer(_to, _amount);
        emit LinkWithdrawn(_to, _amount);
    }

    // Admin functions
    function updateProtocolContract(address _newProtocol) external onlyOwner {
        require(_newProtocol != address(0), "Invalid protocol address");
        protocolContract = _newProtocol;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
