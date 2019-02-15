pragma solidity ^0.5.0;
pragma experimental ABIEncoderV2;

import "./ECTools.sol";

contract MetaBatchProxy {

	address public owner;

	function() external payable {}

	constructor(address _owner) public {
		owner = _owner;
	}

	function getSigner(bytes32 raw, bytes memory sig) public view returns(address signer) {
		return ECTools.prefixedRecover(raw, sig);
	}

	modifier onlyValidSignature(address[] memory target, uint256[] memory value, bytes[] memory data, bytes[] memory dataHashSignature) {
		require(target.length <= 8, 'Too much batched transactions');

		for(uint i=0; i< target.length; i++) {
			bytes32 dataHash = keccak256(abi.encodePacked(target[i], value[i], data[i]));
			address signer = getSigner(dataHash, dataHashSignature[i]);
			require(signer == owner, 'Invalid signature');
		}
		_;
	}

	/**
     * @dev executes a transaction only if it is formatted and signed by the owner of this. Anyone can call execute. Nonce introduced as anti replay attack mechanism.
     * 
     * @param target - the contract to be called
     * @param value - the value to be sent to the target
     * @param data - the data to be sent to be target
     * @param dataHashSignature - signed bytes of the keccak256 of target, nonce, value and data keccak256(target, nonce, value, data)
     */

	function execute(address[] memory target, uint256[] memory value, bytes[] memory data, bytes[] memory dataHashSignature) public onlyValidSignature(target, value, data, dataHashSignature) returns (bool) {
		// solium-disable-next-line security/no-call-value
		for(uint i=0; i< target.length; i++) {
			require(target[i].call.value(value[i])(data[i]), 'unsuccesful call');
		}
		return true;
	}

}
