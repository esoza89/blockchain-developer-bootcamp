// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Token {
	string public name;
	string public symbol;
	uint8 public decimals = 18;
	uint256 public totalSupply;

	constructor (string memory _name, string memory _symbol, uint256 _total) {
		name = _name;
		symbol = _symbol;
		totalSupply = _total* (10**decimals);
	}

}
