const Web3 = require('web3');
const chalk = require("chalk");
const yargs = require('yargs')
const fs = require('fs');
const { exec } = require("child_process");
const shell = require('shelljs');


const harvestCommand = async (options,worldState, gasPriceL) => {

    
    // 1. Create temp work space
    shell.echo(chalk.greenBright(`\n Getting Started in ${options.name} Command ....`));
   
    shell.mkdir('-p', [`./.tmp/${options.name}/`]);
    shell.echo(chalk.greenBright("\n Create temp work space ...."));
   
    // 2. Enter workspace
    shell.echo(chalk.greenBright("\n Entering temp work space ...."));
    shell.cd(`./.tmp/${options.name}/`)
    shell.echo(chalk.greenBright(shell.pwd()));  

    // 3. Pull Down From Git
    await shell.exec(`git clone ${options.url}`)
    shell.echo(chalk.greenBright(` \nEntering ${options.name} work space ....`));
    shell.cd(`./${options.folder}/`)
    shell.echo(chalk.greenBright(shell.pwd()));  

    // 4, Build Env
    shell.echo(chalk.greenBright(`\n Building ${options.name} work space ....`));
    shell.exec(`npm install`)
    await shell.exec(`npm i @openzeppelin/upgrades@2.8.0 --save-dev`);
    await shell.exec(`npm i @openzeppelin/contracts-ethereum-package@2.5.0 --save-dev`);

  
    // 5. Compile contracts
    if(!shell.which('truffle')) {
        shell.echo(chalk.redBright("Truffle not installed aborting....."));
        shell.cd("../../..")
        shell.rm('-rf', './.tmp');
        shell.echo(chalk.greenBright(`Completed  ${options.name} Command ....`));
        return;
    }
    shell.echo(chalk.greenBright(`\n Deploying To development ${options.name} work space ....`));
    await shell.exec(`truffle compile`)

    // 6. migrate contracts to generated folder
    shell.echo(chalk.greenBright(` \n Migrating to Generated Folders ${options.name} work space ....`));
    shell.cp('-R', 'build/', `../../../.generated/${options.folder}`);

    

    // 8. Clean Up temp space
    shell.echo(chalk.redBright("\n Cleaning Up Workspace..."));
    shell.cd("../../..")
    shell.rm('-rf', './.tmp');
    shell.echo(chalk.greenBright(`\n Completed  ${options.name} Command ....`));
};

module.exports = harvestCommand;