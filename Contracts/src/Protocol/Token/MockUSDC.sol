// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MockUSDC is ERC20, Ownable {
    uint256 public constant MINT_BURN_LIMIT = 1000 * 10 ** 6; // 1000 mUSDC (6 decimals)
    uint256 public constant MINT_BURN_COOLDOWN = 1 days; // 24 hours cooldown
    mapping(address => uint256) public lastMintTime; // Last mint timestamp per address
    mapping(address => uint256) public lastBurnTime; // Last burn timestamp per address

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) Ownable(msg.sender) {}

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    // Modified mint function to match IMintableERC20 interface
    function mint(address to, uint256 amount) external {
        require(to != address(0), "Invalid recipient");
        // Optionally, keep restrictions for direct user minting
        if (msg.sender != owner()) {
            require(
                lastMintTime[to] + MINT_BURN_COOLDOWN <= block.timestamp,
                "Can only mint once per day"
            );
            require(amount <= MINT_BURN_LIMIT, "Exceeds mint limit");
            lastMintTime[to] = block.timestamp;
        }
        _mint(to, amount);
    }

    // Burn function compatible with IMintableERC20
    function burn(uint256 amount) external {
        require(amount > 0, "Invalid amount");
        require(balanceOf(msg.sender) >= amount, "Insufficient balance");
        // Optionally, keep restrictions for direct user burning
        if (msg.sender != owner()) {
            require(
                lastBurnTime[msg.sender] + MINT_BURN_COOLDOWN <=
                    block.timestamp,
                "Can only burn once per day"
            );
            lastBurnTime[msg.sender] = block.timestamp;
        }
        _burn(msg.sender, amount);
    }

    // Standard ERC20 transfer function
    function transfer(
        address to,
        uint256 amount
    ) public override returns (bool) {
        require(to != address(0), "Invalid recipient");
        return super.transfer(to, amount);
    }

    // Standard ERC20 approve function
    function approve(
        address spender,
        uint256 amount
    ) public override returns (bool) {
        require(spender != address(0), "Invalid spender");
        return super.approve(spender, amount);
    }

    // Standard ERC20 transferFrom function
    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override returns (bool) {
        require(from != address(0), "Invalid sender");
        require(to != address(0), "Invalid recipient");
        return super.transferFrom(from, to, amount);
    }
}
