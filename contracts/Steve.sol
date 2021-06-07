// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Steve is ERC20 {
    constructor(string memory name_, string memory symbol_, uint256 initialSupply_) ERC20(name_, symbol_) {
      _mint(msg.sender, initialSupply_);
  }

    // Make the contract ownable, set owner upon deployment

    // Add the minting function, make it available to the owner

    // Make the token pausable by the owner
}