const fs = require('fs');
const changelogPath = './CHANGELOG.md';
const GitHelper = require('./git-helper');
const TemplateHelper = require('./template-helper');
const GitlabHelper = require('./gitlab-helper');

const {
  COMMIT_SHA,
  CI_API_V4_URL,
  CI_PROJECT_ID,
  GITLAB_PROJECT_ACCESS_TOKEN,
  CI_DEFAULT_BRANCH,
  CI_COMMIT_TAG,
} = process.env;

if (!CI_API_V4_URL || !CI_PROJECT_ID || !GITLAB_PROJECT_ACCESS_TOKEN || !CI_DEFAULT_BRANCH || (!CI_COMMIT_TAG && !COMMIT_SHA)) {
  const envVarsSet = {
    COMMIT_SHA: !!COMMIT_SHA,
    CI_API_V4_URL: !!CI_API_V4_URL,
    CI_PROJECT_ID: !!CI_PROJECT_ID,
    GITLAB_PROJECT_ACCESS_TOKEN: !!GITLAB_PROJECT_ACCESS_TOKEN,
    CI_DEFAULT_BRANCH: !!CI_DEFAULT_BRANCH,
    CI_COMMIT_TAG: !!CI_COMMIT_TAG,
  }
  console.error('envVarsSet', envVarsSet);
  throw new Error('Not enough env vars set');
}

const gitHelper = new GitHelper({ CI_DEFAULT_BRANCH });
const templateHelper = new TemplateHelper({ CI_COMMIT_TAG });
const gitlabHelper = new GitlabHelper({
  CI_API_V4_URL, CI_PROJECT_ID, CI_COMMIT_TAG, GITLAB_PROJECT_ACCESS_TOKEN, COMMIT_SHA
})

async function index() {
    const details = await gitlabHelper.getDetails();

    const changelogEntry = templateHelper.prepareCommitEntry(details);
    await gitHelper.pull();
    const changelogExists = fs.existsSync(changelogPath);
    const content = changelogExists ? (fs.readFileSync(changelogPath)).toString() : '';
    let fullContent;
    if (CI_COMMIT_TAG) {
      fullContent = content.replace(templateHelper.commitHeader, changelogEntry.header);
    } else {
      const splittedContent = content.split(changelogEntry.header);
      if (splittedContent.length > 1) {
        fullContent = `${splittedContent[0]}${changelogEntry.header}${changelogEntry.content}${splittedContent[1]}`;
      } else {
        fullContent = `${changelogEntry.header}${changelogEntry.content}${splittedContent[0]}`;
      }
    }
    fs.writeFileSync(changelogPath, fullContent);
    await gitHelper.commitPush();
}
index();
