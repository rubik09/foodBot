const { exec } = require('child_process');
const { promisify } = require('util');

const promisifyExec = promisify(exec);

class GitHelper {
  constructor(config) {
    if (!config?.CI_DEFAULT_BRANCH) {
      throw new Error('Not full config on class initialize');
    }
    this.defaultBranch = config.CI_DEFAULT_BRANCH;
  }
  async pull() {
    await promisifyExec(`git pull origin ${this.defaultBranch}`);
  }
  async commitPush() {
    await promisifyExec('git add CHANGELOG.md');
    await promisifyExec('git commit -m "Changelog auto-update"');
    await promisifyExec(`git push origin HEAD:${this.defaultBranch}`);
  }
}

module.exports = GitHelper;
