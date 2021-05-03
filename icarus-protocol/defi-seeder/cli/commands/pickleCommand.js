const shell = require('shelljs');
const chalk = require("chalk");


const { 
    checkWorkspace,
    createWorkSpace, 
    enterWorkSpace, 
    pullFromGit,
    migrateGenerated,
    cleanUpWorkSpace } = require("./baseCommand");


const pickleCommand = async (options,worldState, gasPriceL) => {
    
    // 0. Check if Dir exists
    if(checkWorkspace(options)) return;

    // 1. Create temp work space
    createWorkSpace(options);      
   
    // 2. Enter workspace
    enterWorkSpace(options);

    // 3. Pull Down From Git
    await pullFromGit(options);    

    // 4, Build Env
    shell.echo(chalk.greenBright(`\n Building ${options.name} work space ....`));
    // Install Nix
    if(!shell.which("nix")) {
        await shell.exec(`curl -L https://nixos.org/nix/install | sh`);
    }
    if(!shell.which("dapp")){
        // Install dapp-tools
        await shell.exec(`curl https://dapp.tools/install | sh`)
    }
    
    // 5. Compile contracts    
    shell.echo(chalk.greenBright(`\n Compiling  ${options.name} work space ....`));
    await shell.exec(`dapp update`)
    await shell.exec(`dapp build`)

    // 6. migrate contracts to generated folder
    migrateGenerated(options);

    // 7. Clean Up temp space
    cleanUpWorkSpace(options);
  
};

module.exports = pickleCommand;