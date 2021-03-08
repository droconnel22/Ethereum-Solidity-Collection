const Strings = artifacts.require("Strings");

module.exports = async (deployer, network, accounts) => {
    try {

      
        switch(network) {
            case "mainnet":
            case "mainnet-fork":
                break;
            case "development": // For Ganache mainnet forks
                break;
            case "ropsten":
            case "ropsten-fork":
                //lendingPoolAddressesProviderAddress = "0x1c8756FD2B28e9426CDBDcC7E3c4d64fa9A54728"; 
                break;
            case "kovan":
            case "kovan-fork":
                //lendingPoolAddressesProviderAddress = "0x506B0B2CF20FAA8f38a4E2B524EE43e1f4458Cc5"; 
                break;
            default:
                throw Error(`Are you deploying to the correct network? (network selected: ${network})`)
        }

        return deployer.deploy(Strings)
        .then( async (stringResult) => {
            console.log(`### String address ${stringResult.address}`);
        })
    } catch (e) {
        console.log(`Error in migration: ${e.message}`)
    }  
}