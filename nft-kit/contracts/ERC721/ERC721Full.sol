// SPDX-License-Identifier: MIT
pragma solidity >=0.5.11 <0.9.0;


import "./ERC721.sol";
import "./extensions/ERC721Enumerable.sol";
import "./extensions/ERC721Burnable.sol";
import "./extensions/ERC721Pausable.sol";
import "../access/AccessControlEnumerable.sol";

import "../gsn/Context.sol";
import "../utils/Counters.sol";


contract ERC721Full is Context, AccessControlEnumerable, ERC721Enumerable, ERC721Burnable, ERC721Pausable {
    using Counters for Counters.Counter;

    // Minter Role
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    // Burner Role
    bytes32 public constant BURNER_ROLE = keccak256("BURNER_ROLE");

    // Pauser Role
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // Token Id Counter
    Counters.Counter internal _tokenIdTracker;  

    // Base URI for metadata
    string internal _baseTokenURI;

    // Optional mapping for token URIs
    mapping(uint256 => string) internal _tokenURIs;

    // Token Id to Edition
    mapping(uint256 => bytes16) internal _tokenIdToEdition;

    // Token Id to Price 
    mapping(uint256 => uint256) internal _tokenIdToPriceInWei;
    
    // Token Id to Purchase Time
    mapping(uint256 => uint32) internal _tokenIdToPurchaseFromTime;

    // Token Id to Purchase
    mapping(uint256 => bool) internal _tokenIdToPurchased;

    // Event for Minting
    event Minted(address indexed _artist, uint256 indexed _tokenId, string _tokenURI, bytes16 _edition);

    // Event for Burning
    event Burned(uint256 indexed _tokenId);

    constructor(
    string memory name_, 
    string memory symbol_, 
    string memory baseTokenURI_
      )  ERC721(name_, symbol_) {
        _baseTokenURI = baseTokenURI_;
        _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
        _setupRole(MINTER_ROLE, _msgSender());
        _setupRole(PAUSER_ROLE, _msgSender());
        _setupRole(BURNER_ROLE, _msgSender());
    }

    modifier onlyAdmin() {
        require(hasRole(DEFAULT_ADMIN_ROLE, _msgSender()), "ERC721 Full: Admin Role Required.");
        _;
    }

    modifier onlyPauser(){
        require(hasRole(PAUSER_ROLE, _msgSender()), "ERC721 Full: Pauser Role Required.");
        _;
    }

    modifier onlyMinter(){
        require(hasRole(MINTER_ROLE, _msgSender()), "ERC721 Full: Minter Role Required");
        _;
    }

    modifier onlyBurner(){
         require(hasRole(BURNER_ROLE, _msgSender()), "ERC721 Full: Burner Role Required");
        _;
    }


    /**
    * @dev See {IERC721Metadata-baseURI}.
    */
    function _baseURI() internal view virtual override returns(string memory){
        return _baseTokenURI;
    }

    /**
    * @dev Allows management to update the base tokenURI path
    * @dev Reverts if not called by management
    * @param _newBaseURI the new base URI to set
    */
    function setTokenBaseURI(string calldata _newBaseURI) external onlyAdmin {
        _baseTokenURI = _newBaseURI;
    }

    

     /**
     * @dev See {IERC721Metadata-tokenURI}.
     */
    function tokenURI(uint256 _tokenId) public view override returns (string memory) {
        require(keccak256(abi.encodePacked("")) != keccak256(abi.encodePacked(_tokenURIs[_tokenId])), "ERC721Metadata: Token id query for nonexistent URI.");
        string memory baseURI = _baseURI();
        string storage _tokenURI = _tokenURIs[_tokenId];
        return bytes(baseURI).length > 0
            ? string(abi.encodePacked(baseURI, _tokenURI))
            : '';
    }
     /**
        * @dev Mint a new token
        * @dev Reverts if not called by minter
        * @param _artist the artist of the art
        * @param _tokenURI the IPFS or equivalent hash
        * @param _edition the identifier of the edition - leading 3 bytes are the artist code, trailing 3 bytes are the asset type
    */
    function mint(address _artist, string calldata _tokenURI, bytes16 _edition) external onlyMinter {       
        uint256 _currentTokenId = _tokenIdTracker.current();
        _mint( _artist, _currentTokenId);   
        _populateTokenData(_currentTokenId, _tokenURI, _edition);
        emit Minted(_artist, _currentTokenId, _tokenURI, _edition);    
        _tokenIdTracker.increment();
    }   

    function _populateTokenData(uint256 _tokenId, string memory _tokenURI, bytes16 _edition) internal {
        _tokenURIs[_tokenId] = _tokenURI;
        _tokenIdToEdition[_tokenId] = _edition;
        _tokenIdToPurchased[_tokenId] = false;        
    }

    function burn(uint256 _tokenId) public override {
        super.burn(_tokenId);
        _burn(_tokenId);
        _depopulateTokenData(_tokenId);
        emit Burned(_tokenId);
    }

    function _depopulateTokenData(uint256 _tokenId) internal {
        delete _tokenURIs[_tokenId];
        delete _tokenIdToEdition[_tokenId];
    }    

    /**
     * @dev Pauses all token transfers.
     *
     * See {ERC721Pausable} and {Pausable-_pause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
     function pause() public onlyPauser virtual {
         _pause();
     }

    /**
     * @dev Unpauses all token transfers.
     *
     * See {ERC721Pausable} and {Pausable-_unpause}.
     *
     * Requirements:
     *
     * - the caller must have the `PAUSER_ROLE`.
     */
    function unpause() public onlyPauser {
         _unpause();
    }

    /**
     * @dev Prefixes token transfers.
     *
     * See {ERC721}
     *
     * Requirements:
     *
     * - optional logic embedded before a transfer
     */
    function _beforeTokenTransfer(address _from, address _to, uint256 _tokenId) internal virtual override(ERC721, ERC721Enumerable, ERC721Pausable) {
        super._beforeTokenTransfer(_from, _to, _tokenId);
    }

    /**
     * @dev See {IERC165-supportsInterface}.
     */
    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return interfaceId == type(IERC721).interfaceId
            || interfaceId == type(IERC721Metadata).interfaceId
            || interfaceId == type(IERC721Enumerable).interfaceId
            || interfaceId == type(ERC721Pausable).interfaceId
            || interfaceId == type(ERC721Burnable).interfaceId
            || super.supportsInterface(interfaceId);
    }
}