const Web3 = require('web3');
const chalk = require("chalk");
const yargs = require('yargs')
const fs = require('fs');
const { exec } = require("child_process");
const shell = require('shelljs');

const checkWorkspace = (options) => {
    shell.echo(chalk.greenBright(`\n Checking Workspace folder ${options.folder}....`));
    if (fs.existsSync(`../../../.generated/${options.folder}`)) {
        console.log(chalk.redBright("Already initalized...stopping."));
        return true;
    } else {
        console.log(chalk.greenBright("Workspace is not initalized..."));
        return false;
    }

}


const createWorkSpace = (options) => {
    shell.echo(chalk.greenBright(`\n Getting Started in ${options.name} Command ....`));
    shell.mkdir('-p', [`./.tmp/${options.name}/`]);
    shell.echo(chalk.greenBright("\n Create temp work space ...."));
}  

const enterWorkSpace = (options)  => {
    shell.echo(chalk.greenBright("\n Entering temp work space ...."));
    shell.cd(`./.tmp/${options.name}/`)
    shell.echo(chalk.greenBright(shell.pwd())); 
}

const pullFromGit = async (options) => {
    await shell.exec(`git clone ${options.url}`)
    shell.echo(chalk.greenBright(` \nEntering ${options.name} work space ....`));
    shell.cd(`./${options.folder}/`)
    shell.echo(chalk.greenBright(shell.pwd()));  
}

const migrateGenerated = (options) => {
    shell.echo(chalk.greenBright(` \n Migrating to Generated Folders ${options.name} work space ....`));
    shell.mkdir('-p',`../../../.generated/${options.name}/${options.folder}`)
    shell.cp('-R', 'build/', `../../../.generated/${options.name}/${options.folder}`);

}

const cleanUpWorkSpace = (options) => {
    shell.echo(chalk.redBright("\n Cleaning Up Workspace..."));
    shell.cd("../../..")
    shell.rm('-rf', './.tmp');
    shell.echo(chalk.greenBright(`\n Completed  ${options.name} Command ....`));
}


module.exports = {
    checkWorkspace,
    createWorkSpace,
    enterWorkSpace,
    pullFromGit,
    migrateGenerated,
    cleanUpWorkSpace
}
