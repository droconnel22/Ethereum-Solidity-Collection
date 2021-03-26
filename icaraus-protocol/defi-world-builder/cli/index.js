#!/usr/bin/env node
const Web3 = require('web3');
const chalk = require("chalk");
const yargs = require('yargs')
const fs = require('fs');


// abis
const UniswapV2Router02 = require("../build/contracts/UniswapV2Router02.json");
const UniswapV2Factory = require("../build/contracts/UniswapV2Factory.json");
const UniswapV2Pair = require("../build/contracts/UniswapV2Pair.json");

const ERC20 = require("../build/contracts/erc20.json");

const MockV3Aggregator = require("../build/contracts/MockV3Aggregator.json");

const LendingPool = require("../build/contracts/LendingPool.json");

let worldState = {
    dex: {
        uniswapv2:{
            factory:null,
            router: null,
            pair: {},
           
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
        aave:{}
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
        fs.writeFileSync(`./receipts/receipt_${nowToUnix()}.json`, data, 'utf8', (err) => {
            if (err) {
                console.log(`Error writing file: ${err}`);
            } else {
                console.log(chalk.green(`World State is written successfully!`));        }
        
        });
    }
}


const deploy = async (argv) => {
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
            worldState.dex.uniswapv2.factory = factoryContractInstance.options.address;
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
                    worldState.dex.uniswapv2.factory,
                    worldState.tokens.weth
                ]
            };
            gasEstimate = await routerContract.deploy(options).estimateGas();
            const routerContractInstance = await routerContract.deploy(options).send({
                from: accounts[0],
                gas: gasEstimate,
                gasPrice: gasPriceL, 
            }).on('error', function(error){ console.log(error) })
            worldState.dex.uniswapv2.router = routerContractInstance.options.address;
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
             let bc  ="0x";
             let dc =  "0x";
             bc = LendingPool.bytecode.replace(/__ValidationLogic_______________________/g,"")
            dc = bc.replace(/__ReserveLogic__________________________/g,"")
             if(argv.debug){                 
                 console.log(dc);
             }
             let options = {
                data: dc,
                arguments:[]
            }
             let gasEstimate = await lendingPool.deploy(options).estimateGas();
             const lendingPoolContractInstance = await lendingPool.deploy(options).send({
                from: accounts[0],
                gas: gasEstimate,
                gasPrice: gasPriceL, 
            });
            worldState.providers.aave.lendingPool = lendingPoolContractInstance.options.address;
            console.log(chalk.green(`Providers: Aave Lending Pool Deployed... at ${lendingPoolContractInstance.options.address}`));

         }

         if(argv.pairs.includes("uni-dai-usdc")  && argv.dex.includes("uniswapv2") && argv.tokens.includes("dai") && argv.tokens.includes("usdc")) {
            let factoryContract = new web3.eth.Contract(UniswapV2Factory.abi, worldState.dex.uniswapv2.factory,  {gasPrice: gasPriceL, from: accounts[0]});
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
                worldState.dex.uniswapv2.pair.daiusdc = receipt.events.PairCreated.address;
                console.log(chalk.green(`Uniswap V2 Core: Factory Created Pair DAI/ETH... at ${receipt.events.PairCreated.address}`));
            }

         }

     
    } catch(e) {
        console.log(e);
    }
}


const initializecli = () => {
    yargs
    .scriptName("defi")
    .usage('$0 <cmd> [args]')
    .version('version', 'version', 'display version information')
    .alias('version', 'v')
    .example('defi deploy --dex uniswap --lp aave --erc20 dai usdc')
    .showHelpOnFail(false, 'unable to run command. run with --help')
    .command('state', 'display blockchain state', () => {},async (argv) => {
        await dump(argv);
        end();        
    })
    .command('deploy', 'deploys defi platforms to targetted blockchain', () => {}, async (argv) => {
        await deploy(argv);
        print(argv);
        end();
    })
    .command('create', "creates token pairs", () => {}, async (argv) => {
        end();
    })
    .option("dex",{ 
        array: true, // even single values will be wrapped in [].
        description: 'an array of dexs',
        default: 'uniswapv2, balancer',
        alias: 'd'       
      })
      .option("providers",{ 
        array: true, // even single values will be wrapped in [].
        description: 'an array of lending pool sources',
        default: 'aave',
        alias: 'p'
      })
      .option("tokens", {
          array: true,
          description: "an array of erc20 based assets",
          default: "dai, usdc, link",
          alias:"t"
      })
      .option("vaults", {
        array: true,
        description: "an array of yield vaults",
        default: "curvefi, compund, pickle, dhedge, yearn",
        alias:"t"
      })
      .option("oracles", {
        array: true,
        description: "an array of oracle contracts",
        default: "usdc-eth-price, dai-eth-price",
        alias:"o"
      })
      .option("pairs", {
        array: true,
        description: "an array of pairs to be created",
        default: "uni-usdc-eth, uni-dai-eth",
        alias:"o"
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
const main = async () => {   
    initializecli();
}
main();