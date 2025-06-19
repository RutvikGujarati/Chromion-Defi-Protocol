// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BridgedAVAX is ERC20, Ownable(msg.sender) {
    address public minter;

    modifier onlyMinter() {
        require(msg.sender == minter, "Not authorized");
        _;
    }

    constructor(string memory _tokenName, string memory _symbol) ERC20(_tokenName, _symbol) {}

    function setMinter(address _minter) external onlyOwner {
        minter = _minter;
    }

    function mint(address to, uint256 amount) external onlyMinter {
        _mint(to, amount);
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
