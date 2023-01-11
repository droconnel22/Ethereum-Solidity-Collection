// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721 is IERC165 {
    function balanceOf(address owner) external view returns (uint balance);
    function ownerOf(uint tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint tokenId) external;
    function safeTransferFromData(address from, address to, uint tokenId, bytes calldata data) external;
    function transferFrom(address from, address to, uint tokenId) external;
    function approve(address to, uint tokenId) external;
    function getApproved(uint tokenId) external view returns (address operator);
    function setApprovalForAll(address operator, bool _approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);

    event Transfer(address indexed from, address indexed to, uint indexed id);
    event Approval(address indexed owner, address indexed spender, uint indexed id);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
}

interface IERC721Reciever {
    function onERC721Received(address operator, address from, uint tokenId, bytes calldata data) external returns (bytes4);
}

abstract contract ERC721Example is IERC721 {

    mapping(uint => address) internal _ownerOf;
    mapping(address => uint) internal _balanceOf;
    mapping(uint => address) internal _approvals;
    mapping(address => mapping(address => bool)) public isApprovedForAll;

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return 
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }

    function ownerOf(uint id) external view returns (address owner) {
        owner = _ownerOf[id];
        require(owner != address(0), "Token doesnt exists");
    }

    function balanceOf(address owner) external view returns (uint ) {    
        require(owner != address(0), "owner is zero address");
        return _balanceOf[owner];
    }

    function setApprovalForAll(address operator, bool approved) external{
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function approve(address spender, uint id) external {
        address owner = _ownerOf[id];
        require(
            msg.sender == owner || isApprovedForAll[owner][msg.sender],
            "not authorized"
        );
        _approvals[id] = spender;
        emit Approval(owner, spender, id);
    }

    function getApproved(uint id) external view returns (address) {
        require(_ownerOf[id] != address(0), "Token doesnt exist");
        return _approvals[id];
    }

    function _isApprovedOrOwner(address owner, address spender, uint id) internal view returns (bool) {
        return (
            spender == owner || 
            isApprovedForAll[owner][spender] || 
            spender == _approvals[id]
        );
    }

    function transferFrom(address from, address to, uint id) public {
        require(from == _ownerOf[id], "not current owner");
        require(to != address(0), "cant send to zero addr");
        require(_isApprovedOrOwner(from, msg.sender, id), "not authorized");

        _balanceOf[from]--;
        _balanceOf[to]++;
        _ownerOf[id] = to;
        delete _approvals[id];
        
        emit Transfer(from, to, id);
    }

    function safeTransferFrom(address from, address to, uint id) external {
        transferFrom(from, to, id);
        require(
            to.code.length == 0 ||
            IERC721Reciever(to).onERC721Received(msg.sender, from , id , "") ==
            IERC721Reciever.onERC721Received.selector,
            "unsafe receipient"
        );
    }

    function safeTransferFromData(address from, address to, uint id, bytes calldata data) external {
        transferFrom(from, to, id);
        require(
            to.code.length == 0 ||
            IERC721Reciever(to).onERC721Received(msg.sender, from, id, data) ==
            IERC721Reciever.onERC721Received.selector,
            "Unsafe recipient"
        );
    }

    function _mint(address to, uint id) internal {
        require(to != address(0), "mint to zero");
        require(_ownerOf[id] == address(0), "already minted");

        _balanceOf[to]++;
        _ownerOf[id] = to;

        emit Transfer(address(0), to, id);
    }

    function _burn (uint id) internal {
        address owner = _ownerOf[id];
        require(owner != address(0), "not  minted");

        _balanceOf[owner] -= 1;

        delete _ownerOf[id];
        delete _approvals[id];

        emit Transfer(owner, address(0), id);
    }
}
contract MyNFT is ERC721Example {
    function mint(address to, uint id) external {
        _mint(to, id);
    }

    function burn(uint id) external {
        require(msg.sender == _ownerOf[id], "not owner");
        _burn(id);
    }
}