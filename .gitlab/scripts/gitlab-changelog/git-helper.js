const { exec } = require('child_process');

class GitHelper {
  constructor(config) {
    if (!config || !config.CI_DEFAULT_BRANCH) {
      throw new Error('Not full config on class initialize');
    }
    this.defaultBranch = config.CI_DEFAULT_BRANCH;
    this.promisifyExec = async (command) => {
      const promise = new Promise((res, rej) => {
        exec(command, (err, stdout, stderr) => {
          if (err) {
            console.error(`Error while ${command}`, stderr);
            return rej(stderr);
          }
          return res();
        });
      });
      await Promise.all([promise]);
    }
  }
  async pull() {
    await this.promisifyExec(`git pull origin ${this.defaultBranch}`);
  }
  async commitPush() {
    await this.promisifyExec('git add CHANGELOG.md');
    await this.promisifyExec('git commit -m "Changelog auto-update"');
    await this.promisifyExec(`git push origin HEAD:${this.defaultBranch}`);
  }
}

module.exports = GitHelper;
