#!/usr/bin/env node
const Web3 = require('web3');
const chalk = require("chalk");
const yargs = require('yargs')
const fs = require('fs');
const { exec } = require("child_process");

// commands
const harvestCommand = require("./commands/harvestCommand");
const yearnCommand = require("./commands/yearnCommand");
const curveFiCommand = require("./commands/curveFiCommand");
const snxCommand = require("./commands/snxCommand");
const pickleCommand = require("./commands/pickleCommand");
const dydxCommand = require("./commands/dydxCommand");
const uniswapv2Command = require("./commands/uniswapv2Command");
const {chainlinkCommand, chainlinkHarnessCommand } = require("./commands/chainlinkCommand");
const compCommand = require("./commands/compCommand");
const aaveCommand = require("./commands/aaveCommand");
const hegicCommand = require("./commands/hegicCommand");
const balanacerCommand = require("./commands/balancerCommand");
const bancorCommand = require("./commands/bancorCommand");
const dhedgeCommand = require("./commands/dhedgeCommand");
const kyberCommand = require("./commands/kyberCommand");
const bzxCommand = require("./commands/bzxCommand");

// abis
const UniswapV2Router02 = require("../build/contracts/UniswapV2Router02.json");
const UniswapV2Factory = require("../build/contracts/UniswapV2Factory.json");
const UniswapV2Pair = require("../build/contracts/UniswapV2Pair.json");

const ERC20 = require("../build/contracts/erc20.json");

const MockV3Aggregator = require("../build/contracts/MockV3Aggregator.json");

const LendingPool = require("../build/contracts/LendingPool.json");
const ValidationLogicLibary = require("../build/contracts/ValidationLogic.json")
const ReserveLogicLibrary = require("../build/contracts/ReserveLogic.json");
const GenericLogicLibrary = require("../build/contracts/GenericLogic.json");

// comp
const CErc20 = require("../build/contracts/CErc20.json");
const ComptrollerG6 = require("../build/contracts/ComptrollerG6.json");
const InterestRateModel = require("../build/contracts/InterestRateModel.json");
const JumpRateModel = require("../build/contracts/JumpRateModel.json");


let worldState = {
    dexs: {
        uniswapv2:{
            factory:null,
            router: null,
            pairs: {},
           
        }
    },
    tokens :{
        dai: null,
        usdc: null,
        weth: null
    },
    oracles:{
        
    },
    providers: {
        aave:{},
        comp:{}
    },
    farms: {
        harvest:{},
        pickle: {}
    }
};


Date.prototype.addHours= function(h){
    this.setHours(this.getHours()+h);
    return this;
}

const nowToUnix = () => {
    return Math.floor(new Date().getTime()/1000);
}


const end = () => {
    console.log(chalk.redBright("Done."));    
    process.exit(1);  
}

const dump = async (args) => {
    try {
        let web3 = new Web3(Web3.givenProvider || "ws://127.0.0.1:8545");

        const syncData = await web3.eth.isSyncing();
        console.log(chalk.greenBright(syncData));
        const accounts =  await web3.eth.getAccounts();
        accounts.forEach(acct => console.log(chalk.greenBright`${acct},\n`));    
        web3.eth.defaultAccount = accounts[0];
        console.log(chalk.redBright(web3.eth.defaultAccount));
        const gasPrice = await web3.eth.getGasPrice();
        console.log(chalk.bgRedBright(gasPrice));
        console.log(chalk.bgRedBright(web3.utils.keccak256(gasPrice)));
        console.log(chalk.bgRedBright(web3.utils.soliditySha3(gasPrice)));
        console.log(chalk.bgRedBright(web3.utils.utf8ToHex("This is my secret")));
        console.log(chalk.greenBright(web3.utils.toWei('1', 'ether')));
        console.log(chalk.greenBright(web3.utils.toWei('1', 'gwei')));
        console.log(chalk.greenBright(web3.utils.toWei('1', 'finney')));
        console.log(chalk.greenBright(web3.utils.toWei('1', 'szabo')));
        const networkId = await web3.eth.net.getId();
        console.log(chalk.blue(networkId))
        const peerCount = await web3.eth.net.getPeerCount();
        console.log(chalk.blue(peerCount));

        const createdAccount = web3.eth.accounts.create();
        console.log(chalk.greenBright(createdAccount.address));
        console.log(chalk.greenBright(createdAccount.privateKey));

      
    }  catch(e) {
        console.log(chalk.red(e));
    }
}

const generateGuid =  () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }


const print = (argv) => {

    if(argv.print === true){
        console.log(chalk.green("Writing world state to file...."))
        const data = JSON.stringify(worldState);
        const version = nowToUnix();
        fs.writeFileSync(`./receipts/receipt_latest.json`, data, 'utf8', (err) => {
            if (err) {
                console.log(`Error writing file: ${err}`);
            } else {
                console.log(chalk.green(`World State with id of ${version} written successfully!`));        }
        
        });
    }
};

const initializeState = () => {
    console.log(chalk.red("Loading world state from file...."));
    // './databases.json', 
    fs.readFileSync(`./receipts/receipt_latest.json`, 'utf8', (err, data) => {
        if(err){
            console.log(chalk.red(`Erroor: Loading world state from file: ${err}`));
            return;
        }

        worldState = JSON.parse(data);
        console.log(chalk.green("Latest World State Loading Successfully."));

    })
};

const seed = async (argv) => {
    try {
        if(argv.debug){
            console.log(argv);
        }
        let web3 = new Web3(Web3.givenProvider || "ws://127.0.0.1:8545");
        const accounts =  await web3.eth.getAccounts();
        const gasPriceL = await web3.eth.getGasPrice();

        if(argv.dex.includes('uniswapv2')) {
            // factorys           
            const _feeToSetter = accounts[0];
            const UniswapV2FactoryContract = new web3.eth.Contract(UniswapV2Factory.abi);            
            let options = {
                data: UniswapV2Factory.bytecode,
                arguments:[_feeToSetter]
            };
            let gasEstimate = await UniswapV2FactoryContract.deploy(options).estimateGas();
            const factoryContractInstance = await UniswapV2FactoryContract.deploy(options).send({
                from: accounts[0],
                    gas: gasEstimate,
                    gasPrice: gasPriceL, 
            });
            worldState.dexs.uniswapv2.factory = factoryContractInstance.options.address;
            console.log(chalk.green(`Uniswap V2 Core: Factory Deployed... at ${factoryContractInstance.options.address}`));

            // WETH
            // tring memory name_ , string memory symbol_, uint8 decimals_
            const wethContract = new web3.eth.Contract(ERC20.abi);
            options = {
                data: ERC20.bytecode,
                arguments:[
                    "WETH",
                    "WETH",
                    18
                ]
            };
            gasEstimate = await wethContract.deploy(options).estimateGas();
            const wethContractInstance = await wethContract.deploy(options).send({
                from: accounts[0],
                    gas: gasEstimate,
                    gasPrice: gasPriceL, 
            });
            worldState.tokens.weth = wethContractInstance.options.address;
            console.log(chalk.green(`Uniswap V2 Core: WETH Deployed... at ${wethContractInstance.options.address}`));


            // router
            //  constructor(address _factory, address _WETH) {
            const routerContract = new web3.eth.Contract(UniswapV2Router02.abi);
            options = {
                data: UniswapV2Router02.bytecode,
                arguments:[
                    worldState.dexs.uniswapv2.factory,
                    worldState.tokens.weth
                ]
            };
            gasEstimate = await routerContract.deploy(options).estimateGas();
            const routerContractInstance = await routerContract.deploy(options).send({
                from: accounts[0],
                gas: gasEstimate,
                gasPrice: gasPriceL, 
            }).on('error', function(error){ console.log(error) })
            worldState.dexs.uniswapv2.router = routerContractInstance.options.address;
            console.log(chalk.green(`Uniswap V2 Core: Router 02 Deployed... at ${routerContractInstance.options.address}`));
        } 

        if(argv.tokens.includes("dai")) {
            const daiContract = new web3.eth.Contract(ERC20.abi);
            options = {
                data: ERC20.bytecode,
                arguments:[
                    "Maker Dai",
                    "DAI",
                    18
                ]
            };
            gasEstimate = await daiContract.deploy(options).estimateGas();
            const daiContractInstance = await daiContract.deploy(options).send({
                from: accounts[0],
                    gas: gasEstimate,
                    gasPrice: gasPriceL, 
            });
            worldState.tokens.dai = daiContractInstance.options.address;
            let balance = await daiContractInstance.methods.totalSupply().call({from: accounts[0]});
            console.log(chalk.green(`Tokens: Maker DAI Deployed... at ${daiContractInstance.options.address} with balance of ${balance}`));
        }

        if(argv.tokens.includes("usdc")) {
            const usdcContract = new web3.eth.Contract(ERC20.abi);
            options = {
                data: ERC20.bytecode,
                arguments:[
                    "USD Coin",
                    "USDC",
                    18
                ]
            };
            gasEstimate = await usdcContract.deploy(options).estimateGas();
            const usdcContractInstance = await usdcContract.deploy(options).send({
                from: accounts[0],
                    gas: gasEstimate,
                    gasPrice: gasPriceL, 
            });
            worldState.tokens.usdc = usdcContractInstance.options.address;
            let balance = await usdcContractInstance.methods.totalSupply().call({from: accounts[0]});
            console.log(chalk.green(`Tokens: US Dollar Stable Coin USDC Deployed... at ${usdcContractInstance.options.address} with balance of ${balance}`));
        }

        if(argv.tokens.includes("link")) {
            const linkContract = new web3.eth.Contract(ERC20.abi);
            options = {
                data: ERC20.bytecode,
                arguments:[
                    "Chain Link Token",
                    "LINK",
                    18
                ]
            };
            gasEstimate = await linkContract.deploy(options).estimateGas();
            const linkContractInstance = await linkContract.deploy(options).send({
                from: accounts[0],
                    gas: gasEstimate,
                    gasPrice: gasPriceL, 
            });
            worldState.tokens.link = linkContractInstance.options.address;
            let balance = await linkContractInstance.methods.totalSupply().call({from: accounts[0]});
            console.log(chalk.green(`Tokens: Chain Link Token LINK Deployed... at ${linkContractInstance.options.address} with balance of ${balance}`));
        }

        if(argv.oracles.includes("usdc-eth-price") && argv.tokens.includes("usdc")) {
           const mockAggregatorPriceUSDCETH = new web3.eth.Contract(MockV3Aggregator.abi);
           //  uint8 _decimals,  int256 _initialAnswer
           options = {
               data: MockV3Aggregator.bytecode,
               arguments: [
                   2,
                   170000
               ]
           }
           gasEstimate = await mockAggregatorPriceUSDCETH.deploy(options).estimateGas();
           const mockAggregatorPriceUSDCETHContractInstance = await mockAggregatorPriceUSDCETH.deploy(options).send({
                from: accounts[0],
                gas: gasEstimate,
                gasPrice: gasPriceL, 
            });
            worldState.oracles.usdcethPrice = mockAggregatorPriceUSDCETHContractInstance.options.address;
            console.log(chalk.green(`Oracle: Mock Link Price Oracle for USDC/ETH Deployed... at ${mockAggregatorPriceUSDCETHContractInstance.options.address} with value of 1700`));
        }

        if(argv.oracles.includes("dai-eth-price") && argv.tokens.includes("dai")) {
            const mockAggregatorPriceDAIETH = new web3.eth.Contract(MockV3Aggregator.abi);
            //  uint8 _decimals,  int256 _initialAnswer
            let price = 169900
            options = {
                data: MockV3Aggregator.bytecode,
                arguments: [
                    2,
                    price
                ]
            }
            gasEstimate = await mockAggregatorPriceDAIETH.deploy(options).estimateGas();
            const mockAggregatorPriceDAIETHContractInstance = await mockAggregatorPriceDAIETH.deploy(options).send({
                 from: accounts[0],
                 gas: gasEstimate,
                 gasPrice: gasPriceL, 
             });
             worldState.oracles.daiethPrice = mockAggregatorPriceDAIETHContractInstance.options.address;
             console.log(chalk.green(`Oracle: Mock Link Price Oracle for DAI/ETH Deployed... at ${mockAggregatorPriceDAIETHContractInstance.options.address} with value of ${price}`));
         }

         if(argv.providers.includes("aave")){
             const lendingPool = new web3.eth.Contract(LendingPool.abi);
             const validationLogicLibary = new web3.eth.Contract(ValidationLogicLibary.abi);
             const reserveLogicLibrary = new web3.eth.Contract(ReserveLogicLibrary.abi);
             const genericLogicLibrary = new web3.eth.Contract(GenericLogicLibrary.abi);

            if(argv.debug){
                console.log(GenericLogicLibrary.bytecode);
            }
           let options = {
                data: GenericLogicLibrary.bytecode
            }
            let gasEstimate = await genericLogicLibrary.deploy(options).estimateGas();
            const genericLogicLibraryInstance = await genericLogicLibrary.deploy(options).send({
               from: accounts[0],
               gas: gasEstimate,
               gasPrice: gasPriceL, 
           });
           worldState.providers.aave.genericLogicLibrary = genericLogicLibraryInstance.options.address;
           console.log(chalk.green(`Providers: Aave Generic Logic Library Deployed... at ${genericLogicLibrary.options.address}`));

           let linkedValidationLogicLibraryByteCode = ValidationLogicLibary.bytecode.replace(/__GenericLogic__________________________/g,genericLogicLibraryInstance.options.address.replace("0x", ""))


            if(argv.debug){
                console.log(linkedValidationLogicLibraryByteCode);
            }
            options = {
                 data: linkedValidationLogicLibraryByteCode
             }
             gasEstimate = await validationLogicLibary.deploy(options).estimateGas();
             const validationLogicLibraryInstance = await validationLogicLibary.deploy(options).send({
                from: accounts[0],
                gas: gasEstimate,
                gasPrice: gasPriceL, 
            });
            worldState.providers.aave.validationLogicLibrary = validationLogicLibraryInstance.options.address;
            console.log(chalk.green(`Providers: Aave Validation Logic Library Deployed... at ${validationLogicLibraryInstance.options.address}`));


            options = {
                data: ReserveLogicLibrary.bytecode
            }
            gasEstimate = await reserveLogicLibrary.deploy(options).estimateGas();
            const reserveLogicLibraryInstance = await reserveLogicLibrary.deploy(options).send({
               from: accounts[0],
               gas: gasEstimate,
               gasPrice: gasPriceL, 
            });
            worldState.providers.aave.reserveLogicLibrary = reserveLogicLibraryInstance.options.address;
            console.log(chalk.green(`Providers: Aave Reserve Logic Library Deployed... at ${reserveLogicLibraryInstance.options.address}`));


             let bc  ="0x";
             let dc =  "0x";
             bc = LendingPool.bytecode.replace(/__ValidationLogic_______________________/g,validationLogicLibraryInstance.options.address.replace("0x", ""))
             dc = bc.replace(/__ReserveLogic__________________________/g,reserveLogicLibraryInstance.options.address.replace("0x", ""))
             if(argv.debug){                 
                 console.log(dc);
             }
             options = {
                data: dc,
                arguments:[]
            }
             gasEstimate = await lendingPool.deploy(options).estimateGas();
             const lendingPoolContractInstance = await lendingPool.deploy(options).send({
                from: accounts[0],
                gas: gasEstimate,
                gasPrice: gasPriceL, 
            });
            worldState.providers.aave.lendingPool = lendingPoolContractInstance.options.address;
            console.log(chalk.green(`Providers: Aave Lending Pool Deployed... at ${lendingPoolContractInstance.options.address}`));

         }

         if(argv.providers.includes("comp")){

            let comptrollerInterfaceV6 = new web3.eth.Contract(ComptrollerG6.abi);
            let options = {
                data: ComptrollerG6.bytecode
            };
            let gasEstimate = await comptrollerInterfaceV6.deploy(options).estimateGas();
            const comptrollerInterfaceV6Instance = await comptrollerInterfaceV6.deploy(options).send({
                from: accounts[0],
                gas: gasEstimate,
                gasPrice: gasPriceL, 
            });
            worldState.providers.comp.comptrollerInterfaceV6 = comptrollerInterfaceV6Instance.options.address;
            console.log(chalk.green(`Providers: Comp Comptroller Interface V6 Deployed... at ${comptrollerInterfaceV6Instance.options.address}`));

            //     constructor(uint baseRatePerYear, uint multiplierPerYear, uint jumpMultiplierPerYear, uint kink_) {
            let jumpRateModelContract = new web3.eth.Contract(JumpRateModel.abi);
            options = {
                data: JumpRateModel.bytecode,
                arguments: [
                    new web3.utils.BN(1),
                    new web3.utils.BN(1),
                    new web3.utils.BN(1),
                    new web3.utils.BN(1),
                ]
            };
            gasEstimate = await jumpRateModelContract.deploy(options).estimateGas();
            const jumpRateModelInstance = await jumpRateModelContract.deploy(options).send({
                from: accounts[0],
                gas: gasEstimate,
                gasPrice: gasPriceL, 
            });
            worldState.providers.comp.jumpRateModel =jumpRateModelInstance.options.address;
            console.log(chalk.green(`Providers: Comp Jump Rate Model Deployed... at ${jumpRateModelInstance.options.address}`));
            let cErc20Contract = new web3.eth.Contract(CErc20.abi);

            let name = "cDAIUSDT";
            let symbol = "cDAI";
            options = {
                data: CErc20.bytecode,
                arguments:[
                    worldState.providers.comp.comptrollerInterfaceV6,
                    worldState.providers.comp.jumpRateModel,
                    new web3.utils.BN(100),
                    name,
                    symbol,
                    18
                ]
            }
            gasEstimate = await cErc20Contract.deploy(options).estimateGas();
            const cErc20ContractInstance = await cErc20Contract.deploy(options).send({
                from: accounts[0],
                gas: gasEstimate,
                gasPrice: gasPriceL, 
            })
            worldState.providers.comp.cErc20Contract = cErc20ContractInstance.options.address;
            console.log(chalk.green(`Providers: Comp cERC20 ${symbol}:${name} Market Deployed... at ${cErc20ContractInstance.options.address}`));
         }

         if(argv.pairs.includes("uni-dai-usdc")  && argv.dex.includes("uniswapv2") && argv.tokens.includes("dai") && argv.tokens.includes("usdc")) {
            let factoryContract = new web3.eth.Contract(UniswapV2Factory.abi, worldState.dexs.uniswapv2.factory,  {gasPrice: gasPriceL, from: accounts[0]});
            let unixTimestamp = Math.floor(new Date().addHours(1).getTime()/1000);
            if(argv.debug){
                console.log(unixTimestamp);      
            }  
            gasEstimate = await factoryContract.methods.createPair(worldState.tokens.dai,worldState.tokens.usdc).estimateGas();
            let receipt = await factoryContract.methods.createPair(
                worldState.tokens.dai,worldState.tokens.usdc
            ).send({
                from: accounts[0],
                gas: gasEstimate,
                gasPrice: gasPriceL, 
            });
            if(receipt.events.PairCreated !== null){
                if(argv.debug){
                    console.log(receipt)
                    console.log(worldState);
                }
                worldState.dexs.uniswapv2.pairs.daiusdc = receipt.events.PairCreated.address;
                console.log(chalk.green(`Uniswap V2 Core: Factory Created Pair DAI/ETH... at ${receipt.events.PairCreated.address}`));
            }

         }

     
    } catch(e) {
        console.log(e);
    }
};

const buildContracts = async (argv) => {
    let web3 = new Web3(Web3.givenProvider || "ws://127.0.0.1:8545");
    const accounts =  await web3.eth.getAccounts();
    const gasPriceL = await web3.eth.getGasPrice();

      if(argv.debug) {
          console.log(argv);
      }
      if(argv.farms.includes("harvest")) {
          let options = {
              name:"harvest-finance",
              folder:"harvest",
              builder:"truffle",
              url: "https://github.com/harvest-finance/harvest.git",
              gasPriceL
          }
            await harvestCommand(options, worldState);
      }

      if(argv.providers.includes("yearn")) {
        let options = {
            name:"Yearn-Finance",
            folder:"yearn-protocol",
            builder:"brownie",
            url: "https://github.com/yearn/yearn-protocol.git",
            gasPriceL
        }
        await yearnCommand(options, worldState);
          
    }
    // RUN sed -i 's/const\ maxBuffer\ =\ 1024\ \*\ 1024\ \*\ 10/const maxBuffer = 1024 * 1024 * 1024/' "/usr/lib/node_modules/truffle/build/cli.bundled.js
    if(argv.providers.includes("curvefi")) {
        let options = {
            name:"CurveFi",
            folder:"curve-contract",
            builder:"brownie",
            url: "https://github.com/curvefi/curve-contract.git",
            gasPriceL
        }
        await curveFiCommand(options, worldState);
    }

    if(argv.providers.includes("comp")) {
        let options = {
            name:"compound-protocol",
            folder:"compound-protocol",
            builder:"saddle",
            notes:"currently broken script for big sur mac os",
            url: "https://github.com/compound-finance/compound-protocol.git",
            gasPriceL
        }

        await compCommand(options, worldState);        
    }

    if(argv.dexs.includes("snx")) {
        let options = {
            name:"Synethetix",
            folder:"synthetix",
            builder:"hardhart",
            url: "https://github.com/Synthetixio/synthetix.git",
            gasPriceL
        }
        await snxCommand(options, worldState);
    }

    if(argv.dexs.includes("dydx")) {
        let options = {
            name:"dydx-protocol",
            folder:"perpetual",
            builder:"truffle",
            url: "https://github.com/dydxprotocol/perpetual.git",
            gasPriceL
        }
        await dydxCommand(options, worldState);
    }

    if(argv.dexs.includes("uniswapv2")) {
        let options = {
            name:"uniswapv2core",
            folder:"uniswap-v2-core",
            builder:"waffle",
            url: "https://github.com/Uniswap/uniswap-v2-core.git",
            gasPriceL
        }
       
        await uniswapv2Command(options, worldState);
        options = {
            name:"uniswapv2periphery",
            folder:"uniswap-v2-periphery",
            builder:"waffle",
            deploy: true,
            url: " https://github.com/Uniswap/uniswap-v2-periphery.git",
            gasPriceL
        }
        await uniswapv2Command(options, worldState);
    }

    if(argv.dexs.includes("hegic")) {
        let options = {
            name:"hegic",
            folder:"contracts-v888",
            builder:"truffle",
            deploy: false,
            url: "https://github.com/hegic/contracts-v888.git",
            gasPriceL
        }

        await hegicCommand(options, worldState);
    }

    if(argv.farms.includes("pickle")){
        let options = {
            name:"pickle-finance",
            folder:"protocol",
            builder:"Dapp",
            url: "https://github.com/pickle-finance/protocol.git",
            gasPriceL
        }

        await pickleCommand(options, worldState);
    }

    if(argv.oracles.includes("chainlink")) {
        let options = {
            name:"chain-link",
            folder:"LinkToken",
            builder:"waffle",
            url: "https://github.com/smartcontractkit/LinkToken.git",
            gasPriceL
        }
        await chainlinkCommand(options, worldState);   
        
        options = {
            name:"chain-link",
            folder:"box",
            builder:"truffle",
            deploy: true,
            url: "https://github.com/smartcontractkit/box.git",
            gasPriceL
        }
        await chainlinkHarnessCommand(options, worldState);
    }

    if(argv.providers.includes("aave")) {
        let options = {
            name:"aave",
            folder:"protocol-v2",
            builder:"hardhat",
            deploy: true,
            url: "https://github.com/aave/protocol-v2.git",
            gasPriceL
        }

        await aaveCommand(options, worldState); 
    }

    if(argv.dexs.includes("balancer")) {
        let options = {
            name:"balancer",
            folder:"balancer-core",
            builder:"truffle",
            deploy: false,
            url: "https://github.com/balancer-labs/balancer-core.git",
            gasPriceL
        }

        await balanacerCommand(options, worldState);
    }

    if(argv.dexs.includes("bancor")) {
        let options = {
            name:"bancor",
            folder:"contracts-solidity",
            builder:"truffle",
            deploy: false,
            url: "https://github.com/bancorprotocol/contracts-solidity.git",
            gasPriceL
        }

        await bancorCommand(options, worldState);
    }

    if(argv.farms.includes("dhedge")) {
        let options = {
            name:"dhedge",
            folder:"dhedge-token-solidity",
            builder:"truffle",
            deploy: false,
            url: "https://github.com/dhedge/dhedge-token-solidity.git",
            gasPriceL
        }

        await dhedgeCommand(options, worldState);
    }

    if(argv.providers.includes("kyber")) {
        let options = {
            name:"kyber",
            folder:"smart-contracts",
            builder:"truffle",
            deploy: false,
            url: "https://github.com/KyberNetwork/smart-contracts.git",
            gasPriceL
        }

        await kyberCommand(options, worldState);
    }

    if(argv.providers.includes("bzx")) {
        let options = {
            name:"bZxNetwork",
            folder:"contractsV2",
            builder:"brownie",
            deploy: false,
            url: "https://github.com/bZxNetwork/contractsV2.git",
            gasPriceL
        }

        await bzxCommand(options, worldState);
        
    }

};


const initializecli = () => {
    yargs
    .scriptName("defi")
    .usage('$0 <cmd> [args]')
    .version('version', 'version', 'display version information')
    .alias('version', 'v')
    .example('defi seed --dex uniswap --lp aave --erc20 dai usdc')
    .showHelpOnFail(false, 'unable to run command. run with --help')
    .command('state', 'display blockchain state', () => {},async (argv) => {
        await dump(argv);
        end();        
    })
    .command('seed', 'deploys defi platforms to targetted blockchain', () => {}, async (argv) => {
        await seed(argv);
        print(argv);
        end();
    })
    .command('create', "creates token pairs", () => {}, async (argv) => {
        end();
    })
    .command("build", "deploys defi platforms dynamically", ()=>{}, async(argv) => {
        await buildContracts(argv);
        print(argv);
        end();
    })
    .option("dexs",{ 
        array: true, // even single values will be wrapped in [].
        description: 'an array of dexs',
        default: "",
        alias: 'd'       
      })
      .option("providers",{ 
        array: true, // even single values will be wrapped in [].
        description: 'an array of lending pool sources',
        default: '',
        alias: 'p'
      })
      .option("tokens", {
          array: true,
          description: "an array of erc20 based assets",
          default: "",
          alias:"t"
      })
      .option("vaults", {
        array: true,
        description: "an array of yield vaults",
        default: "",
        alias:"t"
      })
      .option("oracles", {
        array: true,
        description: "an array of oracle contracts",
        default: "",
        alias:"o"
      })
      .option("pairs", {
        array: true,
        description: "an array of pairs to be created",
        default: "",
        alias:"o"
      })
      .option("farms",{
        alias: 'f',
        description: "an array of yield farm strategies",
        default: "",
      })
      .option("print",{
        alias: 'pt',
        type: 'boolean',
        description: 'Write World State'
      })
      .option("debug",{
        alias: 'de',
        type: 'boolean',
        description: 'Show debugging objects'
      })
    .alias("h","help")
    .help()   
    .argv
}

const titleText = `

################################################################################

██████╗ ███████╗███████╗██╗    ███████╗███████╗███████╗██████╗ ███████╗██████╗ 
██╔══██╗██╔════╝██╔════╝██║    ██╔════╝██╔════╝██╔════╝██╔══██╗██╔════╝██╔══██╗
██║  ██║█████╗  █████╗  ██║    ███████╗█████╗  █████╗  ██║  ██║█████╗  ██████╔╝
██║  ██║██╔══╝  ██╔══╝  ██║    ╚════██║██╔══╝  ██╔══╝  ██║  ██║██╔══╝  ██╔══██╗
██████╔╝███████╗██║     ██║    ███████║███████╗███████╗██████╔╝███████╗██║  ██║
╚═════╝ ╚══════╝╚═╝     ╚═╝    ╚══════╝╚══════╝╚══════╝╚═════╝ ╚══════╝╚═╝  ╚═╝

################################################################################
################################################################################
################################################################################

`;


const main = async () => {   
    console.log(chalk.greenBright(titleText));
    initializeState();
    initializecli();
}
main();

