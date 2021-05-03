const Web3 = require('web3');
const chalk = require("chalk");
const yargs = require('yargs')
const fs = require('fs');
const { exec } = require("child_process");
const shell = require('shelljs');

const { 
    createWorkSpace, 
    enterWorkSpace, 
    pullFromGit,
    migrateGenerated,
    cleanUpWorkSpace } = require("./baseCommand");


const bzxCommand = async (options,worldState, gasPriceL) => {
    
    // 1. Create temp work space
    createWorkSpace(options);      
   
    // 2. Enter workspace
    enterWorkSpace(options);

    // 3. Pull Down From Git
    await pullFromGit(options);
    

    // 4, Build Env
    shell.echo(chalk.greenBright(`\n Building ${options.name} work space ....`));
    await shell.exec(`pip install -r requirements.txt`)

  
    // 5. Compile contracts    
    shell.echo(chalk.greenBright(`\n Compiling To development ${options.name} work space ....`));
    shell.exec(`brownie compile`)

    // 6. migrate contracts to generated folder
    migrateGenerated(options);

    // 7. Clean Up temp space
    cleanUpWorkSpace(options);
  
};

module.exports = bzxCommand;