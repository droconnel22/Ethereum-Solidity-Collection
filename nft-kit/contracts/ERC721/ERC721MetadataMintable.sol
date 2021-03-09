
// SPDX-License-Identifier: MIT

pragma solidity >=0.5.11 <0.9.0;


import "./ERC721.sol";
import "./ERC721Metadata.sol";
import "../access/roles/MinterRole.sol";


abstract contract ERC721MetadataMintable is ERC721, ERC721Metadata, MinterRole {
    /**
     * @dev Function to mint tokens.
     * @param to The address that will receive the minted tokens.
     * @param tokenId The token id to mint.
     * @param tokenURI The token URI of the minted token.
     * @return A boolean that indicates if the operation was successful.
     */
    function mintWithTokenURI(address to, uint256 tokenId, string memory tokenURI) public onlyMinter returns (bool) {
        _mint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
        return true;
    }

    function _burn(address owner, uint256 tokenId) internal override(ERC721, ERC721Metadata) {
        super._burn(owner,tokenId);
    } 

}