const Web3 = require('web3');
const chalk = require("chalk");
const yargs = require('yargs')
const fs = require('fs');
const { exec } = require("child_process");
const shell = require('shelljs');


const yearnCommand = async (options,worldState, gasPriceL) => {

    
    // 1. Create temp work space
    shell.echo(chalk.greenBright(`\n Getting Started in ${options.name} Command ....`));
   
    shell.mkdir('-p', [`./.tmp/${options.name}/`]);
    shell.echo(chalk.greenBright("\n Create temp work space ...."));
   
    // 2. Enter workspace
    shell.echo(chalk.greenBright("\n Entering temp work space ...."));
    shell.cd(`./.tmp/${options.name}/`)
    shell.echo(chalk.greenBright(shell.pwd()));  

    // 2a.
    if(!shell.which('brownie')) {
        shell.echo(chalk.greenBright("\n Installing Brownie Python Smart Contract Builder ...."));
        await shell.exec(`pip install eth-brownie`);
    }

    // 3. Pull Down From Git
    shell.exec(`git clone ${options.url}`)
    shell.echo(chalk.greenBright(` \nEntering ${options.name} work space ....`));
    shell.cd(`./${options.folder}/`)
    shell.echo(chalk.greenBright(shell.pwd()));  

    // 4, Build Env
    shell.echo(chalk.greenBright(`\n Building ${options.name} work space ....`));
    await shell.exec(`yarn install --lock-file`)

  
    // 5. Compile contracts    
    shell.echo(chalk.greenBright(`\n Compiling To development ${options.name} work space ....`));
    await shell.exec(`brownie compile`)

     // 6. migrate contracts to generated folder
     shell.echo(chalk.greenBright(` \n Migrating to Generated Folders ${options.name} work space ....`));
     shell.mkdir('-p',`../../../.generated/${options.folder}`)
     shell.cp('-R', './build/', `../../../.generated/${options.folder}`);
 

    // 6. contracts to local blockchain env
    // shell.echo(chalk.greenBright(` \n Deploying To Dev ${options.name} work space ....`));
    // shell.exec(`truffle migrate --network=development --reset >> ../../output.txt`);
    // shell.cat("../../output.txt")

    // 7. Clean Up temp space
    shell.echo(chalk.redBright("\n Cleaning Up Workspace..."));
    shell.cd("../../..")
    shell.rm('-rf', './.tmp');
    shell.echo(chalk.greenBright(`\n Completed  ${options.name} Command ....`));
};

module.exports = yearnCommand;