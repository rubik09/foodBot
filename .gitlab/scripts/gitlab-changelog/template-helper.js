class TemplateHelper {
  constructor(config) {
    if (!config) {
      throw new Error('Not full config on class initialize');
    }
    this.ciCommitTag = config.CI_COMMIT_TAG
    this.commitHeader = `
# -- Unreleased --
`;
    this.tagHeader = `
# Release $$tagVersion ($$date)
Changes: $$tagMessage<br />`
    this.commitTemplate = `
- ($$date) [$$mergeName]($$mergeLink)<br />$$mergeDescription<br />[$$authorName]($$authorLink)<br />`;
  }

  formatDate (dateString = Date.now()) {
    const date = new Date(dateString);
    const dateNumber = date.getUTCDate() < 10 ? `0${date.getUTCDate()}` : date.getUTCDate();
    const month = date.getUTCMonth() + 1 < 10 ? `0${date.getUTCMonth() + 1}` : date.getUTCMonth() + 1;
    const year = date.getUTCFullYear();
    return `${dateNumber}-${month}-${year}`;
  }

  prepareCommitEntry(details) {
    const date = this.formatDate(details.mergedAt);
    const content = this.ciCommitTag
        ? undefined
        : this.commitTemplate
            .replace('$$mergeName', details.title)
            .replace('$$mergeLink', details.link)
            .replace('$$mergeDescription', details.description)
            .replace('$$authorName', details.author.name)
            .replace('$$authorLink', details.author.link)
            .replace('$$date', date);
    const header = this.ciCommitTag
        ? this.tagHeader
            .replace('$$tagVersion', this.ciCommitTag)
            .replace('$$tagMessage', details.message)
            .replace('$$date', date)
        : this.commitHeader;
    return { content, header };
  }
}

module.exports = TemplateHelper;
