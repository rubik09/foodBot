const { readFile } = require('node:fs');
const path = require('node:path');
const utils = require('node:util');
const { 
    createPage,
    updatePageContent,
    getPageByTitle,
    getPageVersion,
    createOrUpdatePageAttachments,
 } = require('./page-helper');
const { CONFLUENCE_PARENT_PAGE_ID } = require('./constants');

const asyncReadFile = utils.promisify(readFile);



const assertEnvs = () => {
    if (
        !process.env.OPENAPI_SPEC_FILEPATH 
        || !process.env.DEPENDENCIES_GRAPH_FILEPATH 
        || !process.env.CONFLUENCE_SPACE_ID
        || !process.env.CONFLUENCE_SPACE_KEY
        || !process.env.CONFLUENCE_OPENAPI_PAGE_NAME
        || !process.env.CONFLUENCE_DEPENDENCIES_GRAPH_PAGE_NAME
        || !process.env.CONFLUENCE_BASE_URL
        || !process.env.CONFLUENCE_API_USER_EMAIL
        || !process.env.CONFLUENCE_API_TOKEN
        || !process.env.CONFLUENCE_PARENT_PAGE_ID
    ) throw new Error('No required variables found', process.env);
}


(async function main() {
    assertEnvs();

    // export openapi-spec
    const specPageOrNothing = await getPageByTitle(
        process.env.CONFLUENCE_OPENAPI_PAGE_NAME
    );
    console.log(specPageOrNothing);
    const { id: specPageId, title } = specPageOrNothing || await createPage(
        process.env.CONFLUENCE_OPENAPI_PAGE_NAME,
        '<p>placeholder</p>',
    );
    const openApiSpec = await asyncReadFile(process.env.OPENAPI_SPEC_FILEPATH);
    const escapedSpec = `
    <ac:structured-macro ac:name="code">
      <ac:plain-text-body>
        <![CDATA[${openApiSpec}]]>
      </ac:plain-text-body>
    </ac:structured-macro>`;
    const openApiSpecFilename = path.parse(process.env.OPENAPI_SPEC_FILEPATH).base;
    await createOrUpdatePageAttachments(CONFLUENCE_PARENT_PAGE_ID, openApiSpec, openApiSpecFilename);
    const openApiSpecLastVersion = await getPageVersion(specPageId);
    await updatePageContent(specPageId, title, escapedSpec, openApiSpecLastVersion.number);
    
    // export deps graph
    const depsPageOrNothing = await getPageByTitle(
        process.env.CONFLUENCE_DEPENDENCIES_GRAPH_PAGE_NAME
    )
    const { id: depsPageId, title: depsTitle } = depsPageOrNothing || await createPage(
        process.env.CONFLUENCE_DEPENDENCIES_GRAPH_PAGE_NAME,
        '<p>placeholder</p>',
    );
    const depsGraph = await asyncReadFile(process.env.DEPENDENCIES_GRAPH_FILEPATH);
    const depsGraphFilename = path.parse(process.env.DEPENDENCIES_GRAPH_FILEPATH).base;
    await createOrUpdatePageAttachments(depsPageId, depsGraph, depsGraphFilename);
    const depsGraphContent = `
    <ac:image>
        <ri:attachment ri:filename="${depsGraphFilename}" />
    </ac:image>
    `;
    const depsGraphVersion = await getPageVersion(depsPageId);
    await updatePageContent(depsPageId, depsTitle, depsGraphContent, depsGraphVersion.number);
    
})()