// SPDX-License-Identifier: MIT
pragma solidity <0.9.0;

import "../interfaces/IJAR.sol";
import "../interfaces/IMASTERCHEF.sol";
import "../interfaces/uniswapv2/IUniswapRouterV2.sol";
import "../interfaces/uniswapv2/IUniswapV2Factory.sol";
import "../interfaces/uniswapv2/IUniswapV2Pair.sol";
import "../interfaces/ICONTROLLER.sol";
import "../interfaces/ISTAKINGREWARDS.sol";
import "../interfaces/ISTAKINGREWARDSFACTORY.sol";

import "../utils/safemath.sol";

import "../tokens/erc20.sol";
import "../tokens/SafeErc20.sol";

abstract contract StrategyBase {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    // Performance fees = start with 20%
    uint256 public performanceTreasuryFee = 2000;
    uint256 public constant performanceTreasuryMax = 10000;

    uint256 public performanceDevFee = 0;
    uint256 public constant performanceDevMax = 10000;

   // Withdrawal fee 0% 
   // - 0% to treasury
   // - 0% to dev fund
   uint256 public withdrawalTreasuryFee = 0;
   uint256 public constant withdrawalTreasuryMax = 100000;

   uint256 public withdrawalDevFundFee = 0;
   uint256 public constant withdrawalDevFundMax = 100000;

   // Tokens
   address public want;
   address public constant weth = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;

   // User accounts 
   address public governance;
   address public controller;
   address public strategist;
   address public timelock;

   // Decentralized Exchanges (DEX)
   address public univ2Router2 = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
   address public sushiRouter = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;

   mapping(address => bool) public harvesters;

   constructor(
       address want_,
       address governance_,
       address strategist_,
       address controller_,
       address timelock_
   ) {
       require(want_ != address(0));
       require(governance_ != address(0));
       require(strategist_ != address(0));
       require(controller_ != address(0));
       require(timelock_ != address(0));

       want = want_;
       governance = governance_;
       strategist = strategist_;
       controller = controller_;
       timelock = timelock_;
   }

   // Modifiers

   modifier onlyBenevolent {
       require(
           harvesters[msg.sender] ||
           msg.sender == governance ||
           msg.sender == strategist
       );
       _;
   }

   // Getters
   
   function balanceOfWant() public view returns (uint256) {
       return IERC20(want).balanceOf(address(this));
   }

   function balanceOfPool() public virtual view returns (uint256);

   function balanceOf() public view returns (uint256) {
       return balanceOfWant().add(balanceOfPool());
   }

   function getName() external virtual pure returns (string memory);

   // Setters

   function whitelistHarvester(address _harvester) external {
       require(msg.sender == governance || msg.sender == strategist, "not authorized");
       harvesters[_harvester] = true;
   }

   function revokeHarvester(address _harvester) external {
        require(msg.sender == governance || msg.sender == strategist, "not authorized");
        harvesters[_harvester] = false;
   }

   function setWithdrawalDevFundFee(uint256 _withdrawalDevFundFee) external {
        require(msg.sender == timelock, "!timelock");
        withdrawalDevFundFee = _withdrawalDevFundFee;
   }

   function setWithdrawalTreasuryFee(uint256 _withdrawalTreasuryFee) external {
        require(msg.sender == timelock, "!timelock");
        withdrawalTreasuryFee = _withdrawalTreasuryFee;
   }

   function setPerformanceDevFee(uint256 _performanceDevFee) external {
       require(msg.sender == timelock, "!timelock");
       performanceDevFee = _performanceDevFee;
   }

   function setPerformanceTreasuryFee(uint256 _performanceTreasuryFee)  external {
      require(msg.sender == timelock, "!timelock");
      performanceTreasuryFee = _performanceTreasuryFee;
   }

   function setStrategist(address _strategist) external {
       require(msg.sender == governance, "!governance");
        strategist = _strategist;
   }

   function setGovernance(address _governance) external {
       require(msg.sender == governance, "!governance");
       governance = _governance;
   }

   function setTimelock(address _timelock) external {
       require(msg.sender == timelock, "!timelock");
       timelock = _timelock;
   }

   function setController(address _controller) external {
       require(msg.sender != timelock, "!timelock");
       controller = _controller;
   }

   // State Changes

   function deposit() public virtual;


    // Controller only function for minting additional rewards
    function withdraw(IERC20 _asset) external returns (uint256 balance) {
        require(msg.sender == controller, "!controller");
        require(want != address(_asset), "want");
        balance = _asset.balanceOf(address(this));
        _asset.safeTransfer(controller, balance);
    }

    // Withdraw partial funds, normally used with a jar withdrawal
    function withdraw(uint256 _amount) external {
        require(msg.sender == controller, "!controller");
        uint256 _balance = IERC20(want).balanceOf(address(this));
        if(_balance < _amount) {
            _amount = _withdrawSome(_amount.sub(_balance));
            _amount = _amount.add(_balance);
        }

        uint256 _feeDev = _amount.mul(withdrawalDevFundFee).div(withdrawalDevFundMax);
        IERC20(want).safeTransfer(ICONTROLLER(controller).devfund(),_feeDev);

        uint256 _feeTreasury = _amount.mul(withdrawalTreasuryFee).div(withdrawalTreasuryMax);
        IERC20(want).safeTransfer(ICONTROLLER(controller).treasury(), _feeTreasury);

        address _jar = ICONTROLLER(controller).jars(address(want));
        require(_jar != address(0),"!jar");

        IERC20(want).safeTransfer(_jar, _amount.sub(_feeDev).sub(_feeTreasury));
    }

    function _withdrawSome(uint256 _amount) internal virtual returns (uint256);

    function harvest() public virtual;

    function execute(address _target, bytes memory _data) 
        public
        payable
        returns (bytes memory response)
        {
            require(msg.sender == timelock, "!timelock");
            require(_target != address(0), "!target");

            assembly {
                let succeeded := delegatecall(
                    sub(gas(), 5000),
                    _target,
                    add(_data, 0x20),
                    mload(_data),
                    0,
                    0
                )
                let size := returndatasize()

                response := mload(0x40)
                mstore(
                    0x40,
                    add(response, and(add(add(size, 0x20), 0x1f), not(0x1f)))
                )
                mstore(response,size)
                returndatacopy(add(response, 0x20), 0, size)

                switch iszero(succeeded)
                    case 1 {
                        // throw if delegate call fails
                        revert(add(response, 0x20), size)
                    }
            }
        }

         function _swapUniswap(
        address _from,
        address _to,
        uint256 _amount
    ) internal {
        require(_to != address(0));

        address[] memory path;

        if (_from == weth || _to == weth) {
            path = new address[](2);
            path[0] = _from;
            path[1] = _to;
        } else {
            path = new address[](3);
            path[0] = _from;
            path[1] = weth;
            path[2] = _to;
        }

        UniswapRouterV2(univ2Router2).swapExactTokensForTokens(
            _amount,
            0,
            path,
            address(this),
            block.timestamp.add(60)
        );
    }

    function _swapUniswapWithPath(
        address[] memory path,
        uint256 _amount
    ) internal {
        require(path[1] != address(0));

        UniswapRouterV2(univ2Router2).swapExactTokensForTokens(
            _amount,
            0,
            path,
            address(this),
            block.timestamp.add(60)
        );
    }

    function _swapSushiswap(
        address _from,
        address _to,
        uint256 _amount
    ) internal {
        require(_to != address(0));

        address[] memory path;

        if (_from == weth || _to == weth) {
            path = new address[](2);
            path[0] = _from;
            path[1] = _to;
        } else {
            path = new address[](3);
            path[0] = _from;
            path[1] = weth;
            path[2] = _to;
        }

        UniswapRouterV2(sushiRouter).swapExactTokensForTokens(
            _amount,
            0,
            path,
            address(this),
            block.timestamp.add(60)
        );
    }

    function _swapSushiswapWithPath(
        address[] memory path,
        uint256 _amount
    ) internal {
        require(path[1] != address(0));

        UniswapRouterV2(sushiRouter).swapExactTokensForTokens(
            _amount,
            0,
            path,
            address(this),
            block.timestamp.add(60)
        );
    }

    function _distributePerformanceFeesAndDeposit() internal {
        uint256 _want = IERC20(want).balanceOf(address(this));

        if(_want > 0){
            // Treasury fees
            IERC20(want).safeTransfer(
                ICONTROLLER(controller).treasury(),
                _want.mul(performanceTreasuryFee).div(performanceTreasuryMax)
            );

            // Performance Fee
            IERC20(want).safeTransfer(
                ICONTROLLER(controller).devfund(),
                _want.mul(performanceDevFee).div(performanceDevMax)
            );

            deposit();
        }
    }
}