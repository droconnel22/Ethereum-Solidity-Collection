const shell = require('shelljs');
const chalk = require("chalk");


const { 
    checkWorkspace,
    createWorkSpace, 
    enterWorkSpace, 
    pullFromGit,
    migrateGenerated,
    cleanUpWorkSpace } = require("./baseCommand");


const bancorCommand = async (options,worldState, gasPriceL) => {
    // 0. Check if workspace exists
    if (checkWorkspace(options)) return;
    
    // 1. Create temp work space
    createWorkSpace(options);      
   
    // 2. Enter workspace
    enterWorkSpace(options);

    // 3. Pull Down From Git
    await pullFromGit(options);    

    // 4, Build Env
    shell.echo(chalk.greenBright(`\n Building ${options.name} work space ....`));
    await shell.exec(`yarn`)

  
    // 5. Compile contracts    
    shell.echo(chalk.greenBright(`\n Compiling  ${options.name} work space ....`));
    await shell.exec(`yarn build`)

    // 6. migrate contracts to generated folder
    shell.echo(chalk.greenBright(` \n Migrating to Generated Folders ${options.name} work space ....`));
    shell.mkdir('-p',`../../../.generated/${options.name}/${options.folder}`)
    shell.cp('-R', 'solidity/', `../../../.generated/${options.name}/${options.folder}`);

    // 7. Clean Up temp space
    cleanUpWorkSpace(options);
  
};

module.exports = bancorCommand;