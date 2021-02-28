// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0;

import "./safemath.sol";
import "../utils/Context.sol";
import "../interfaces/IERC20.sol";

contract erc20 is Context, IERC20 {
    using SafeMath for uint256;

    mapping(address => uint256) private _balances;

    mapping(address => mapping(address => uint256)) private _allowances;

    uint256 private _totalSupply;

    string private _name;

    string private _symbol;

    uint8 private _decimals;

    constructor (string memory name_ , string memory symbol_, uint8 decimals_) {
        _name = name_;
        _symbol = symbol_;
        _decimals = decimals_;
    }

    // Getters
    function name() public view virtual returns (string memory){
        return _name;
    }

    function symbol() public view virtual returns (string memory){
        return _symbol;
    }

    function decimals() public view virtual returns (uint8){
        return _decimals;
    }

    function totalSupply() public view virtual override returns (uint256){
        return _totalSupply;
    }

    // Public functions

    function balanceOf(address account) public view virtual override returns (uint256) {
        return _balances[account];
    }

    function transfer(address _to, uint256 _amount) public virtual override returns (bool) {
        _transfer(_msgSender(), _to, _amount);
        return true;      
    }
    

    function allowance(address _owner, address _spender) public view virtual override returns (uint256) {
        return _allowances[_owner][_spender];
    }

    function approve(address _spender, uint256 _amount) public virtual override returns (bool) {
        _approve(_msgSender(), _spender, _amount);
        return true;
    }

    function transferFrom(address _from, address _to, uint256 _amount) public virtual override returns (bool) {
        _transfer(_from, _to, _amount);
        uint256 currentAllowance = _allowances[_from][_msgSender()];
        require(currentAllowance >= _amount, "ERC20: transfer amount exceeds allowance");
        uint256 netAmount = currentAllowance.sub(_amount);
        _approve(_from,_msgSender(), netAmount);
        return true;
    }

    function increaseAllowance(address _spender, uint256 value) public virtual returns (bool) {
        uint256 increasedAllowanceValue =  _allowances[_msgSender()][_spender].add(value);
        _approve(_msgSender(), _spender, increasedAllowanceValue);
        return true;
    }

    function decreaseAllowance(address _spender, uint256 value) public virtual returns (bool){
        uint256 currentAllowance = _allowances[_msgSender()][_spender];
        require(currentAllowance >= value, "Decrease exceeds current allowance");
        uint256 decreasedAllowanceValue = currentAllowance.sub(value);
        _approve(_msgSender(), _spender, decreasedAllowanceValue);
        return true;
    }

    function _transfer(address _from, address _to, uint256 _amount) private {        
        require(_from != address(0), "ERC20: transfer from the zero address");
        require(_to != address(0),  "ERC20: transfer from the zero address");        
        
        _beforeTokenTransfer(_from, _to, _amount);

        uint256 senderBalance = _balances[_from];
        require(senderBalance >= _amount, "ERC20: transfer amount exceeds balance");

        _balances[_from] = _balances[_from].sub(_amount);
        _balances[_to] = _balances[_to].add(_amount);

        emit Transfer(_from, _to, _amount);
    }

    function _mint(address _account, uint256 _amount) internal virtual {
        require(_account != address(0), "ERC20: mint to the zero address");

        _beforeTokenTransfer(address(0), _account, _amount);

        _totalSupply = _totalSupply.add(_amount);
        _balances[_account] = _balances[_account].add(_amount);
        emit Transfer(address(0), _account, _amount);
    }

    function _burn(address _account, uint256 _amount) internal virtual {
        require(_account != address(0), "ERC20: burn from the zero address");
        _beforeTokenTransfer(_account, address(0), _amount);
        uint256 currentBalance = _balances[_account];
        require(currentBalance >= _amount, "ERC20: burn amount exceeds current balance");      
        _totalSupply = _totalSupply.sub(_amount);
        _balances[_account] = _balances[_account].sub(_amount);
        emit Transfer(_account,address(0), _amount);
    }

    function _approve(address _owner, address _spender, uint256 _amount) internal virtual {
        require(_owner != address(0));
        require(_spender != address(0));
        _allowances[_owner][_spender] = _amount;
        emit Approval(_owner, _spender, _amount);
    }

    function _beforeTokenTransfer(address _from, address _to, uint256 _amount) internal virtual { }
}