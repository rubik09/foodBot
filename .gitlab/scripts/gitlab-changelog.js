const axios = require('axios');

const version = require('../../package.json').version;
const branch = 'master';

// Allow to access the environment variables
require('dotenv').config();

const GITLAB_PROJECT_ACCESS_TOKEN = process.env.GITLAB_PROJECT_ACCESS_TOKEN;
const GITLAB_PROJECT_CHANGELOG_API = process.env.GITLAB_PROJECT_CHANGELOG_API;

axios
  .post(
    GITLAB_PROJECT_CHANGELOG_API,
    { version, branch },
    {
      headers: {
        ['Content-Type']: 'application/json',
        ['PRIVATE-TOKEN']: GITLAB_PROJECT_ACCESS_TOKEN,
      },
    },
  )
  .then((response) => {
    if (response.status === 200) console.log(`Updated changelog`);
  })
  .catch((err) => {
    console.log(err);
    throw new Error(err);
  });
