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
        // Check if success is false
        if (response.data.success === false) {
            core.setFailed("API request was not successful");
            core.info(JSON.stringify(response.data, null, 2));
            core.setOutput("message", JSON.stringify(response.data, null, 2));
        } else {
            // Set the response data as the output
            core.info("Success Job");
            core.info(JSON.stringify(response.data, null, 2));
            core.setOutput("message", JSON.stringify(response.data, null, 2));
        }
    }).catch(error => {
        core.setFailed(error.message);
        core.info("Failed Job");
        core.info(error.message);
    });
} catch (error) {
    core.setFailed(error.message);
}