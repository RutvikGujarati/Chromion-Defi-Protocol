// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library TokenManager {
    struct TokenConfig {
        bool isAllowed;
        uint8 decimals;
        bool isBorrowable;
        address sourceToken;
    }

    struct TokenStorage {
        mapping(address => TokenConfig) allowedTokens;
        mapping(address => address) sourceToDestinationToken;
        address[] allDestinationTokens;
    }

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

    function addToken(
        TokenStorage storage self,
        address _destinationToken,
        address _sourceToken,
        uint8 _decimals,
        bool _isBorrowable
    ) internal {
        require(
            _destinationToken != address(0),
            "Invalid destination token address"
        );
        require(_sourceToken != address(0), "Invalid source token address");
        require(
            !self.allowedTokens[_destinationToken].isAllowed,
            "Destination token already allowed"
        );
        require(
            self.sourceToDestinationToken[_sourceToken] == address(0),
            "Source token already paired"
        );

        self.allowedTokens[_destinationToken] = TokenConfig({
            isAllowed: true,
            decimals: _decimals,
            isBorrowable: _isBorrowable,
            sourceToken: _sourceToken
        });
        self.sourceToDestinationToken[_sourceToken] = _destinationToken;
        self.allDestinationTokens.push(_destinationToken);
        emit TokenAdded(
            _destinationToken,
            _sourceToken,
            _decimals,
            _isBorrowable
        );
    }

    function removeToken(
        TokenStorage storage self,
        address _destinationToken
    ) internal {
        require(
            self.allowedTokens[_destinationToken].isAllowed,
            "Destination token not allowed"
        );
        address sourceToken = self.allowedTokens[_destinationToken].sourceToken;
        delete self.sourceToDestinationToken[sourceToken];
        delete self.allowedTokens[_destinationToken];
        // Note: Array cleanup is gas-intensive; consider alternative storage patterns if needed
        for (uint256 i = 0; i < self.allDestinationTokens.length; i++) {
            if (self.allDestinationTokens[i] == _destinationToken) {
                self.allDestinationTokens[i] = self.allDestinationTokens[
                    self.allDestinationTokens.length - 1
                ];
                self.allDestinationTokens.pop();
                break;
            }
        }
        emit TokenRemoved(_destinationToken);
    }

    function updateToken(
        TokenStorage storage self,
        address _destinationToken,
        address _sourceToken,
        bool _isBorrowable
    ) internal {
        require(
            self.allowedTokens[_destinationToken].isAllowed,
            "Destination token not allowed"
        );
        require(_sourceToken != address(0), "Invalid source token address");

        address oldSourceToken = self
            .allowedTokens[_destinationToken]
            .sourceToken;
        if (oldSourceToken != _sourceToken) {
            delete self.sourceToDestinationToken[oldSourceToken];
            self.sourceToDestinationToken[_sourceToken] = _destinationToken;
        }

        self.allowedTokens[_destinationToken].sourceToken = _sourceToken;
        self.allowedTokens[_destinationToken].isBorrowable = _isBorrowable;
        emit TokenUpdated(_destinationToken, _sourceToken, _isBorrowable);
    }

    function validateToken(
        TokenStorage storage self,
        address _destinationToken,
        uint8 _decimals
    ) internal view returns (address sourceToken) {
        require(
            self.allowedTokens[_destinationToken].isAllowed,
            "Token not allowed"
        );
        require(
            self.allowedTokens[_destinationToken].decimals == _decimals,
            "Invalid decimals"
        );
        return self.allowedTokens[_destinationToken].sourceToken;
    }
}
