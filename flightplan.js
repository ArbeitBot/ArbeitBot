/*eslint-disable */
const plan = require('flightplan');
const config = require('./config');

const appName = 'arbeit-bot';
const username = 'deploy';

const tmpDir = `${appName}-${new Date().getTime()}`;

/** Configuration */
plan.target('production', [{
  host: config.production_url,
  username,
  privateKey: config.ssh_rsa_path,
  agent: process.env.SSH_AUTH_SOCK,
}]);

plan.local((local) => {
  local.log('Copy files to remote hosts');
  const filesToCopy = local.exec('git ls-files', { silent: true });
  local.transfer(filesToCopy, `/tmp/${tmpDir}`);
});

plan.remote((remote) => {
  remote.log('Move folder to root');
  remote.sudo(`cp -R /tmp/${tmpDir} ~`, { user: username });
  remote.rm(`-rf /tmp/${tmpDir}`);

  remote.log('Install dependencies');
  remote.sudo(`npm --production --prefix ~/${tmpDir} install ~/${tmpDir}`, { user: username });

  remote.log('Reload application');
  remote.sudo(`ln -snf ~/${tmpDir} ~/${appName}`, { user: username });
  remote.exec('sudo systemctl restart arbeit-bot');
});
