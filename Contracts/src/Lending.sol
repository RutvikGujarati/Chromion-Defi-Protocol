// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.20;

// import {ILending} from "./interfaces/ILending.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
// import {IPriceFeed} from "./interfaces/IPriceFeed.sol";

contract LendingCrossChain is  ReentrancyGuard {
    using SafeERC20 for IERC20;

    address public owner;
    // IPriceFeed public priceFeed;

    event LoanCreated(
        address indexed borrower,
        uint256 amount,
        uint256 collateral
    );
    event LoanRepaid(address indexed borrower, uint256 amount);
    event CollateralWithdrawn(address indexed borrower, uint256 amount);

    constructor(address _priceFeed) {
        owner = msg.sender;
        // priceFeed = IPriceFeed(_priceFeed);
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    function createLoan(
        uint256 amount,
        uint256 collateral
    ) external nonReentrant {
        // Logic to create a loan
        emit LoanCreated(msg.sender, amount, collateral);
    }

    function repayLoan(uint256 amount) external nonReentrant {
        // Logic to repay a loan
        emit LoanRepaid(msg.sender, amount);
    }

    function withdrawCollateral(uint256 amount) external nonReentrant {
        // Logic to withdraw collateral
        emit CollateralWithdrawn(msg.sender, amount);
    }
}
