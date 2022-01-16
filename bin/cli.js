#!/usr/bin/env node
const { execSync } = require('child_process');

const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const WHITE = '\x1b[37m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';

const getColoredText = (text, color) => {
  if (color == null) {
    // eslint-disable-next-line no-param-reassign
    color = WHITE;
  }
  return color + text + RESET;
};

const runCommand = (command) => {
  try {
    execSync(`${command}`, { stdio: 'inherit' });
  } catch (e) {
    console.error(
      getColoredText(`Failed to execute ${command}. Error: ${e}`, RED)
    );
    return false;
  }
  return true;
};

const repoName = process.argv[2];
const gitCheckoutCommand = `git clone --depth 1 https://github.com/gobeam/truthy ${repoName}`;
const installDepsCommand = `cd ${repoName} && yarn install`;

console.log(
  getColoredText(`Cloning the repository with name ${repoName}`, CYAN)
);
const checkedOut = runCommand(gitCheckoutCommand);
if (!checkedOut) process.exit(-1);

console.log(getColoredText(`Installing dependencies for ${repoName}`, YELLOW));
const installedDeps = runCommand(installDepsCommand);
if (!installedDeps) process.exit(-1);

console.log(
  getColoredText(
    'Congratulations! You are ready. Follow the following commands to start',
    MAGENTA
  )
);
console.log(getColoredText(`cd ${repoName} && yarn start:dev`, GREEN));
