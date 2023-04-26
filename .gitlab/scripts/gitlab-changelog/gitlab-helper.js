class GitlabHelper {
  constructor(config) {
    if (!config?.CI_API_V4_URL || !config?.CI_PROJECT_ID || !config?.GITLAB_PROJECT_ACCESS_TOKEN) {
      throw new Error('Not full config on class initialize');
    }
    this.gitlabUrl = `${config.CI_API_V4_URL}/projects/${config.CI_PROJECT_ID}`;
    this.ciCommitTag = config.CI_COMMIT_TAG;
    this.gitlabAccessToken = config.GITLAB_PROJECT_ACCESS_TOKEN;
    this.commitSha = config.COMMIT_SHA;
  }

  async requestToGitlab(url) {
    const res = await fetch(url, {
      headers: { 'PRIVATE-TOKEN': this.gitlabAccessToken },
    });
    if (res.ok) {
      return res.json();
    } else {
      throw new Error(`Request to ${url} failed`, res);
    }
  }

  async getCommitDetails() {
    const commit = this.commitInfo;
    const mergeNumber = commit.message.split(`See merge request ${this.projectInfo.fullProjectName}!`)[1]?.split(' ')?.[0];
    if (!mergeNumber) {
      return {
        title: `Commit: ${commit.title}`,
        description: commit.message,
        link: commit.web_url,
        mergedAt: commit.created_at,
        author: {
          name: commit.author_name,
          link: `${this.projectInfo.baseUrl}/${commit.author_email.split('@')[0]}`,
        }
      };
    }
    const url = `${this.gitlabUrl}/merge_requests/${mergeNumber}`;
    const info = await this.requestToGitlab(url);
    const author = info.assignee
        ? { name: info.assignee.name, link: info.assignee.web_url }
        : { name: info.author.name, link: info.author.web_url }
    return {
      title: `Merge Request: ${info.title}`,
      description: info.description,
      link: info.web_url,
      mergedAt: info.merged_at,
      author,
    };
  }

  async getTagDetails() {
    const url = `${this.gitlabUrl}/repository/tags/${this.ciCommitTag}`;
    const info = await this.requestToGitlab(url);
    return {
      message: info.message,
    };
  }

  async getCommitInfo() {
    if (this.ciCommitTag) {
      this.commitInfo = {};
      return;
    }
    const url = `${this.gitlabUrl}/repository/commits/${this.commitSha}`;
    this.commitInfo = await this.requestToGitlab(url);
  }

  async getProjectInfo() {
    if (this.ciCommitTag) {
      this.projectInfo = {};
      return;
    }
    const info = await this.requestToGitlab(this.gitlabUrl);
    this.projectInfo = {
      url: info.web_url,
      fullProjectName: info.path_with_namespace,
      baseUrl: info._links?.self?.split('/api/v4')[0],
    };
  }
}

module.exports = GitlabHelper;