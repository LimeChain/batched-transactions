pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/ERC20Mintable.sol";
import "openzeppelin-solidity/contracts/token/ERC20/ERC20Detailed.sol";

contract MetaToken is ERC20Mintable, ERC20Detailed {

	constructor() public ERC20Detailed("Meta", "MTA", 18) {}

}
