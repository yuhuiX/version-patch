'use strict';

const helper = require('./helper');

module.exports = exportEnvVariables;


/**
 * Exports the jenkins.properties file used by Jenkins EnvInject plugin
 * @param {object} obj - Parameter object
 * @param {function} obj.exportedFile - The path of the file to be exported
 * @param {function} obj.callback - The callback function after creating the
 *    target file, with arguments {appVersion: appVersion}
 * @return {undefined}
 */
function exportEnvVariables({callback, exportedFile}) {
  if (!exportedFile) {
    return helper.fatal('exportedFile for exportEnvVariables must be given');
  }

  const packageJson = helper.readFileAsJson('package.json');

  const currentVersion = packageJson.version;
  let checkTagCommand = [];
  checkTagCommand.push('if git tag --list | egrep -q "^' + currentVersion
    + '$"');
  checkTagCommand.push('then echo "tag ' + currentVersion
    + ' found, use new version"');
  checkTagCommand.push('else echo "tag ' + currentVersion
    + ' not found, use current version"');
  checkTagCommand.push('fi');

  helper.execute(checkTagCommand.join('\n'), (stdout) => {
    let appVersion = helper.patchVersion(currentVersion);
    let commands = [];

    if (stdout.indexOf('not') >= 0) {
      appVersion = currentVersion;
    }

    let jenkinsVariables = [];
    jenkinsVariables.push('APP_VERSION=' + appVersion);
    commands.push('echo "' + jenkinsVariables.join('\n')
      + '" > ' + exportedFile);

    helper.execute(commands.join(' && '), () => {
      if (callback) {
        callback({appVersion: appVersion});
      }
    });
  });
}