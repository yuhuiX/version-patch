'use strict';

const helper = require('./helper');

module.exports = commitBuild;


/**
 * Does a commit of the Jenkins build, with appVersion as parameter
 * @param {string} appVersion The new version of the application
 * @return {undefined}
 */
function commitBuild(appVersion) {
  if (!appVersion) {
    return helper.fatal('appVersion for commitBuild must be given');
  }

  const packageJson = helper.readFileAsJson('package.json');

  const currentVersion = packageJson.version;
  let commands = [];

  if (appVersion !== currentVersion) {
    commands.push('npm --no-git-tag-version version ' + appVersion);
    commands.push('git add .');
    commands.push('git commit -m "[ci skip]: Release build ' +
      appVersion + '"');
  }

  helper.execute(commands.join(' && '));
}
