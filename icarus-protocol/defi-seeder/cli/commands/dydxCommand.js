const shell = require('shelljs');
const chalk = require("chalk");
const { exec } = require("child_process");


const { 
    checkWorkspace,
    createWorkSpace, 
    enterWorkSpace, 
    pullFromGit,
    migrateGenerated,
    cleanUpWorkSpace } = require("./baseCommand");


const dydxCommand = async (options,worldState, gasPriceL) => {

    // 0. Check If Work Space Exists
    if (checkWorkspace(options)) return;
    
    // 1. Create temp work space
    createWorkSpace(options);      
   
    // 2. Enter workspace
    enterWorkSpace(options);

    // 3. Pull Down From Git
    await pullFromGit(options);
    

    // 4, Build Env
    shell.echo(chalk.greenBright(`\n Building ${options.name} work space ....`));
    await shell.exec(`npm install`)
    await shell.exec(`npm i eth-json-rpc-filters --save-dev`)

  
    // 5. Compile contracts    
    shell.echo(chalk.greenBright(`\n Compiling  ${options.name} work space ....`));
    // npm i eth-json-rpc-filters
    await shell.exec(`truffle compile`)

    // 6. migrate contracts to generated folder
    // note name change..
    migrateGenerated(options);

    // 7. Clean Up temp space
    cleanUpWorkSpace(options);
  
};

module.exports = dydxCommand;