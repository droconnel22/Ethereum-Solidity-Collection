const StrategyBasisBacDaiLp = artifacts.require("StrategyBasisBacDaiLp");
const PickleToken = artifacts.require("PickleToken");
const Timelock = artifacts.require("Timelock");
const MasterChefImpl = artifacts.require("MasterChefImpl");

module.exports = async (deployer, network, accounts) => {
    try {

        let admin_ = "";
        let goverance_ = "";
        let strategist_= "";
        let controller_= "";
        let timelock_= "";
        let days = 0;
        switch(network) {
            case "mainnet":
            case "mainnet-fork":
                break;
            case "development": // For Ganache mainnet forks

                // max 10
                goverance_ = accounts[1];
                strategist_ = accounts[2];
                controller_ = accounts[3];
                timelock_ = accounts[4]; 
                admin_ = accounts[5];    
                // https://www.epochconverter.com/ -> unix time conversions
                // 4 days, 15 hours, 6 minutes and 40 seconds.
                days = 400000;
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

        return deployer.deploy(PickleToken)
        .then( async (pickleTokenResult) => {
            console.log("### Pickle Token: ", pickleTokenResult);
            return deployer.deploy(Timelock,admin_,days)
            .then(async (timelockResult) => {
                return deployer.deploy(StrategyBasisBacDaiLp, goverance_,strategist_,controller_,timelock_)
                .then(strategyResult => {
                    console.log("completed....");
                });
            })
        })
    } catch (e) {
        console.log(`Error in migration: ${e.message}`)
    }  
}