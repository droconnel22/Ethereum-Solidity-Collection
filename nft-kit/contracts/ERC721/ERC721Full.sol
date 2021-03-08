// SPDX-License-Identifier: MIT

pragma solidity >=0.5.11 <0.9.0;
import "./ERC721.sol";
import "./ERC721Enumerable.sol";
import "./ERC721Metadata.sol";

/**
 * @title Full ERC721 Token
 * @dev This implementation includes all the required and some optional functionality of the ERC721 standard
 * Moreover, it includes approve all functionality using operator terminology.
 *
 * See https://eips.ethereum.org/EIPS/eip-721
 */
contract ERC721Full is ERC721, ERC721Enumerable, ERC721Metadata {
    constructor (string memory name_, string memory symbol_) ERC721Metadata(name_, symbol_) {
        // solhint-disable-previous-line no-empty-blocks
    }

    function _burn(address owner, uint256 tokenId) internal override(ERC721, ERC721Enumerable, ERC721Metadata) { }

    function _mint(address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable) {}

    function _transferFrom(address from, address to, uint256 tokenId) internal override(ERC721, ERC721Enumerable) {}
    
}
