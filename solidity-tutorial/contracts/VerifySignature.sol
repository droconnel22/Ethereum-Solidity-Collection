// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

/*
    0. message to sign
    1. hash(message)
    2. sign(hash(message), private_key) | offchain
    3. ecrecover(hash(message), signature) == signer
*/

contract VerifySig {
    function verify(address _signer, string memory _message, bytes memory _signature)  external pure returns (bool){
        bytes32 messageHash = getMessageHash(_message);
        bytes32 ethSignedMessageHash = getEthSignedMessageHash(messageHash);

        return recover(ethSignedMessageHash, _signature) == _signer;
    }

    function getMessageHash(string memory _message) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(_message));
    }

    function getEthSignedMessageHash(bytes32 _messageHash) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(
            "\x19Ethereum Signed Message: \n32",
            _messageHash
        ));
    }

    function recover(bytes32 _ethSignedMessageHash, bytes memory _sig) public pure returns (address) {
        (bytes32 r, bytes32 s, uint8 v) = _split(_sig);
        return ecrecover(_ethSignedMessageHash, v, r, s);
    }

    function _split(bytes memory _signature) internal pure returns(bytes32 r, bytes32 s, uint8 v) {
        // 32 length, 32 length, 1 length = 65
        require(_signature.length == 65, "Invalid signature length");

        // dyanmic data first 32 stores the lenght of the data
        // variable _signature is not he actual sig, pointer to where it is stored in memory
        // values implicity  assinged to return types.
        assembly {
            // from the pointer to signature skip the first 32 bytes because it holds the lenght of the arry
            r := mload(add(_signature,32))
            s := mload(add(_signature,64))
            // get the first byte after the first byte after 96 bytes
            v := byte(0,mload(add(_signature,96)))
        }
    }
}