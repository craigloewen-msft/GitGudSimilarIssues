// Import required libraries
const core = require('@actions/core');
const axios = require('axios');

try {
    // Get the input values
    const issueTitle = core.getInput('issuetitle');
    const repo = core.getInput('repo');

    // Construct the API URL
    const url = `https://gitgudissues.azurewebsites.net/api/getsimilarissues/${repo}/${issueTitle}`;

    const distanceTolerance = 2;

    // Send a GET request to the API
    axios.get(url).then(response => {
        // Check if success is false
        if (response.data.success === false) {
            core.info(JSON.stringify(response.data, null, 2));
            core.info(url);
            core.setFailed("API request was not successful");
        } else {
            // Filter the similarIssues array
            const similarIssues = response.data.similarIssues.filter(issue => issue.score !== 0 && issue.score <= distanceTolerance);

            core.info("Similar issues:");
            core.info(JSON.stringify(similarIssues, null, 2));
            core.info("All issues:");
            core.info(JSON.stringify(response.data.similarIssues, null, 2));

            // Check if the filtered array has a length of 0
            if (similarIssues.length === 0) {
                core.setFailed("No similar issues found");
            } else {
                // Format the output message
                let message = "Here are the most similar issues:\n";
                similarIssues.forEach(issue => {
                    message += `- [${issue.title} (#${issue.number})](${issue.html_url})\n`;
                });

                // Set the output message
                core.info("Success Job");
                core.info(message);
                core.setOutput("message", message);
            }
        }
    }).catch(error => {
        core.setFailed(error.message);
    });
} catch (error) {
    core.setFailed(error.message);
}