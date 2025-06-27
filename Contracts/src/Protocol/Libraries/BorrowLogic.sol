// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./TokenManager.sol";

library BorrowLogic {
    uint256 public constant LOAN_TO_VALUE_RATIO = 70; // 70% LTV
    uint256 public constant MIN_BORROW = 1e6; // 6 decimals base
    uint256 public constant MAX_BORROW = 1e12 * 1e6; // 6 decimals base

    struct BorrowStorage {
        mapping(address => mapping(address => uint256)) deposits; // user => sourceToken => amount
        mapping(address => mapping(address => uint256)) borrowings; // user => destinationToken => amount
        mapping(address => mapping(address => uint256)) borrowTimestamps; // user => destinationToken => timestamp
    }

    function getMaxBorrow(
        BorrowStorage storage self,
        TokenManager.TokenStorage storage tokenStorage,
        address _user,
        address _destinationToken
    ) internal view returns (uint256) {
        if (!tokenStorage.allowedTokens[_destinationToken].isBorrowable)
            return 0;

        uint256 totalCollateral = 0;
        for (uint256 i = 0; i < tokenStorage.allDestinationTokens.length; i++) {
            address destToken = tokenStorage.allDestinationTokens[i];
            if (!tokenStorage.allowedTokens[destToken].isAllowed) continue;

            address sourceToken = tokenStorage
                .allowedTokens[destToken]
                .sourceToken;
            uint256 collateralAmount = self.deposits[_user][sourceToken];
            if (collateralAmount == 0) continue;

            totalCollateral += collateralAmount;
        }

        uint256 maxBorrowable = (totalCollateral * LOAN_TO_VALUE_RATIO) / 100;

        uint256 totalBorrowed = 0;
        for (uint256 i = 0; i < tokenStorage.allDestinationTokens.length; i++) {
            address destToken = tokenStorage.allDestinationTokens[i];
            if (!tokenStorage.allowedTokens[destToken].isBorrowable) continue;
            totalBorrowed += self.borrowings[_user][destToken];
        }

        return
            totalBorrowed >= maxBorrowable ? 0 : maxBorrowable - totalBorrowed;
    }

    function validateBorrow(
        BorrowStorage storage self,
        TokenManager.TokenStorage storage tokenStorage,
        address _destinationToken,
        uint256 _amount,
        address _user
    ) internal view returns (uint256 current) {
        require(
            tokenStorage.allowedTokens[_destinationToken].isBorrowable,
            "Token not borrowable"
        );
        require(_amount >= MIN_BORROW, "Borrow below minimum");
        require(_amount <= MAX_BORROW, "Borrow exceeds maximum");

        current = self.borrowings[_user][_destinationToken];
        uint256 maxBorrow = getMaxBorrow(
            self,
            tokenStorage,
            _user,
            _destinationToken
        );

        require(current + _amount <= maxBorrow, "Insufficient collateral");
    }

    function validateRepay(
        BorrowStorage storage self,
        address _destinationToken,
        uint256 _amount,
        address _user
    ) internal view {
        require(_amount > 0, "Invalid repay amount");
        require(
            self.borrowings[_user][_destinationToken] >= _amount,
            "Repay exceeds borrowed amount"
        );
    }

    function hasOutstandingDebt(
        BorrowStorage storage self,
        TokenManager.TokenStorage storage tokenStorage,
        address _user
    ) internal view returns (bool) {
        for (uint256 i = 0; i < tokenStorage.allDestinationTokens.length; i++) {
            address destToken = tokenStorage.allDestinationTokens[i];
            if (!tokenStorage.allowedTokens[destToken].isBorrowable) continue;
            uint256 debt = self.borrowings[_user][destToken];
            if (debt > 0) return true;
        }
        return false;
    }
}
