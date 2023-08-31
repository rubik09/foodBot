const { Blob } = require('node:buffer');

const { 
    CONFLUENCE_BASE_URL, 
    CONFLUENCE_BASIC_AUTH, 
    CONFLUENCE_SPACE_ID, 
    CONFLUENCE_SPACE_KEY, 
    CONFLUENCE_PARENT_PAGE_ID 
} = require('./constants');

const createPage = async (title, content) => {
    console.log(CONFLUENCE_BASIC_AUTH);
    const res = await fetch(`${CONFLUENCE_BASE_URL}/wiki/api/v2/pages/`, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${CONFLUENCE_BASIC_AUTH}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            spaceId: CONFLUENCE_SPACE_ID,
            status: 'current',
            parentId: CONFLUENCE_PARENT_PAGE_ID,
            title,
            body: {
                representation: 'storage',
                value: content
            }
        }),
    });
    const resBody = await res.json();
    console.log('Create page results');
    console.log(resBody);
    if (res.status !== 200) {
        console.log(res.status);
        throw new Error('Fail while creating page');
    }
    console.log('Create page results (page)');
    console.log(resBody);

    return resBody;
}

const updatePageContent = async (pageId, title, content, versionNumber) => {
    const newVersionNumber = Number(versionNumber) + 1;
    console.log('update page content: page id is ' + pageId + '; version ' + newVersionNumber);
    const res = await fetch(`${CONFLUENCE_BASE_URL}/wiki/api/v2/pages/${Number(pageId)}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${CONFLUENCE_BASIC_AUTH}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            id: pageId,
            spaceId: CONFLUENCE_SPACE_ID,
            status: 'current',
            title,
            version: {
                number: newVersionNumber,
                message: 'Updated version automatically'
            },
            body: {
                representation: 'storage',
                value: content
            }
        }),
    });
    const responseBody = await res.json();
    console.log('updated content');
    console.log(responseBody);
    if (res.status !== 200) {
        throw new Error('Failed at updatePagecontent, status: ' + res.status);
    }
}

const getPageByTitle = async (title) => {
    const res = await fetch(`${CONFLUENCE_BASE_URL}/wiki/rest/api/content?type=page&spaceKey=${CONFLUENCE_SPACE_KEY}&title=${title}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${CONFLUENCE_BASIC_AUTH}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
    });
    const responseBody = await res.json();
    console.log('getPageByTitle');
    console.log(responseBody);

    if (res.status !== 200) {
        throw new Error('Fail while getting page by title');
    }

    if (
        responseBody?.results 
        && 'length' in responseBody?.results 
        && responseBody?.results?.[0]
    ) {
        return responseBody.results[0];
    }
    return undefined;
}

const createOrUpdatePageAttachments = async (pageId, fileContents, filename) => {
    console.log('create attachments: page id is ' + pageId);
    const formData = new FormData();
    formData.append('file', new Blob([fileContents]), filename);
    formData.append('minorEdit', true);

    const res = await fetch(`${CONFLUENCE_BASE_URL}/wiki/rest/api/content/${pageId}/child/attachment`, {
        method: 'PUT',
        headers: {
          'Authorization': `Basic ${CONFLUENCE_BASIC_AUTH}`,
          'Accept': 'application/json',
          'X-Atlassian-Token': 'nocheck',
        },
        body: formData,
      });

    const responseBody = await res.json();
    console.log('createOrUpdate attachments');
    console.log(responseBody);
    if (res.status !== 200) {
        throw new Error('Fail while createOrUpdate page attachments');
    }
}

const getPageVersion = async (pageId) => {
    const res = await fetch(`${CONFLUENCE_BASE_URL}/wiki/api/v2/pages/${pageId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${CONFLUENCE_BASIC_AUTH}`,
          'Accept': 'application/json',
        },
    });
    const responseBody = await res.json();
    console.log('getPageVersion');
    console.log(responseBody);
    if (res.status !== 200) {
        throw new Error('Fail on getPageVersion');
    }

    return responseBody.version;
}

module.exports = {
    createPage,
    updatePageContent,
    getPageByTitle,
    createOrUpdatePageAttachments,
    getPageVersion,
}