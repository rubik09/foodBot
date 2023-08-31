const CONFLUENCE_SPACE_ID = String(process.env.CONFLUENCE_SPACE_ID);
const CONFLUENCE_SPACE_KEY = process.env.CONFLUENCE_SPACE_KEY;
const CONFLUENCE_BASE_URL = process.env.CONFLUENCE_BASE_URL || 'https://1win1.atlassian.net';
const CONFLUENCE_PARENT_PAGE_ID = process.env.CONFLUENCE_PARENT_PAGE_ID;
const CONFLUENCE_BASIC_AUTH = Buffer
                    .from(
                        `${process.env.CONFLUENCE_API_USER_EMAIL}:${process.env.CONFLUENCE_API_TOKEN}`
                    )
                    .toString('base64');

module.exports = {
    CONFLUENCE_BASE_URL,
    CONFLUENCE_BASIC_AUTH,
    CONFLUENCE_SPACE_ID,
    CONFLUENCE_SPACE_KEY,
    CONFLUENCE_PARENT_PAGE_ID,
}