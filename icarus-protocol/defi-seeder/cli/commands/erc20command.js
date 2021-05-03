const { option } = require("yargs");
const ERC20 = require("../../build/contracts/erc20.json");

const createErc20Command = async(_options,worldState,gasPriceL) => {
    const erc20Contract = new web3.eth.Contract(ERC20.abi);
            let deployOptions = {
                data: ERC20.bytecode,
                arguments:[
                    _options.name,
                    _options.symbol,
                    _options.decimal
                ]
            };
            gasEstimate = await erc20Contract.deploy(deployOptions).estimateGas();
            const erc20ContractInstance = await daiContract.deploy(deployOptions).send({
                from: accounts[0],
                    gas: gasEstimate,
                    gasPrice: gasPriceL, 
            });
            worldState.tokens[_options.symbol] = erc20ContractInstance.options.address;
            let balance = await erc20ContractInstance.methods.totalSupply().call({from: accounts[0]});
            console.log(chalk.green(`Tokens: ${_options.symbol} Deployed... at ${erc20ContractInstance.options.address} with balance of ${balance}`));
}

module.exports = createErc20Command;