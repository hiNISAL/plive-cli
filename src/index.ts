import config from './config';

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');
const inquirer = require('inquirer');

const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')
const argv = yargs(hideBin(process.argv)).argv

const create = async (projectName: string) => {
  if (!projectName) {
    console.error('\nSpecify a project name:\n\nplive create <project-name>\n\n');

    return;
  }

  const projectPath = path.resolve(process.cwd(), projectName);

  if (fs.existsSync(projectPath)) {
    console.error(`\nProject folder "${projectName}" already exists.\n\n`);

    return;
  }

  const answer = await inquirer
    .prompt([
      {
        type: 'list',
        name: 'type',
        message: 'Type of project',
        choices: ['browser', 'node', 'bun'],
      },
    ]);

  const { type } = answer;

  fs.mkdirSync(projectPath);

  console.log(`Creating a new project in ${projectPath}.`);
  try {
    await new Promise((resolve, reject) => {
      const git = spawn('git', ['clone', config.REPO, projectPath]);

      git.on('exit', () => {
        resolve(null);
      });

      git.on('error', (error: any) => {
        reject(error);
      });
    });
  } catch {
    console.error('Failed to clone the project template.');
    return;
  }

  const branch = type === 'browser' ? 'browser' : 'node';

  execSync(`git checkout ${branch}`, { cwd: projectPath, stdio: 'ignore' });

  await new Promise((resolve) => {
    fs.rm(path.resolve(projectPath, '.git'), { recursive: true }, () => {
      resolve({});
    });
  });

  [
    'index.html',
    'package.json',
    'readme.md',
    'vite.config.ts',
  ].forEach((filename) => {
    try {
      const filepath = path.resolve(projectPath, filename);

      let file = fs.readFileSync(filepath, 'utf-8');

      file = file.replace(/plive/igm, projectName);

      fs.writeFileSync(filepath, file);
    } catch {}
  });

  console.log('Installing dependencies...');
  try {
    execSync(`npm install`, { cwd: projectPath, stdio: 'ignore' });
  } catch {}

  console.log(`Project "${projectName}" created.\n\n`);
};

(async () => {
  const { _: [command, arg] } = argv;

  if (command === 'create') {
    create(arg);

    return;
  }
})();
