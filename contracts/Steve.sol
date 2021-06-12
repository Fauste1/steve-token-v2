// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract Steve is ERC20, Ownable, Pausable {
  constructor(string memory name_, string memory symbol_, uint256 initialSupply_) ERC20(name_, symbol_) {
    _mint(msg.sender, initialSupply_);
  }

  function mint(uint amount) external onlyOwner {
    _mint(msg.sender, amount);
  }

  function pauseToken() external onlyOwner {
    _pause();
  }

  function unpauseToken() external onlyOwner {
    _unpause();
  }

  function transfer(address recipient, uint256 amount) public virtual override whenNotPaused returns (bool) {
    _transfer(_msgSender(), recipient, amount);
    return true;
  }
}