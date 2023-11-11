// Import required libraries
const core = require('@actions/core');
const axios = require('axios');

try {
    // Get the input values
    const issueTitle = core.getInput('issuetitle');
    const repo = core.getInput('repo');

    // Construct the API URL
    const url = `https://gitgudissues.azurewebsites.net/api/getsimilarissues/${repo}/${issueTitle}`;

    // Send a GET request to the API
    axios.get(url).then(response => {
        // Set the response data as the output
        core.info("Success Job");
        core.info(response.data.toString());
        core.setOutput("message", response.data.toString());
    }).catch(error => {
        core.setFailed(error.message);
        core.info("Failed Job");
        core.info(error.message);
    });
} catch (error) {
    core.setFailed(error.message);
}