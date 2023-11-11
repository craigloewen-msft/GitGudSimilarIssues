// Import required libraries
const core = require('@actions/core');
const axios = require('axios');

try {
    // Get the input values
    const issueTitle = core.getInput('issuetitle');
    const repo = core.getInput('repo');
    const distanceTolerance = parseFloat(core.getInput('eucldistancetolerance'));

    if (distanceTolerance == null || distanceTolerance === 0 || isNaN(distanceTolerance)) {
        core.setFailed("Invalid distance tolerance");
    }

    // Construct the API URL
    const url = `https://gitgudissues.azurewebsites.net/api/getsimilarissues/${repo}/${issueTitle}`;


    // Send a GET request to the API
    axios.get(url).then(response => {
        // Check if success is false
        if (response.data.success === false) {
            core.info(JSON.stringify(response.data, null, 2));
            core.info(url);
            core.setFailed("API request was not successful");
        } else {
            // Filter the similarIssues array
            const similarIssues = response.data.similarIssues
                .filter(issue => issue.score !== 0 && issue.score <= distanceTolerance)
                .sort((a, b) => a.score - b.score);

            core.info("Similar issues:");
            core.info(JSON.stringify(similarIssues, null, 2));
            core.info("All issues:");
            core.info(JSON.stringify(response.data.similarIssues, null, 2));

            // Check if the filtered array has a length of 0
            if (similarIssues.length === 0) {
                core.setFailed("No similar issues found");
            } else {
                // Format the output message
                let message = "Hi I'm an AI powered bot that finds similar issues based off the issue title.\n\nPlease view the issues below to see if they solve your problem, and if the issue describes your problem please consider closing\
                this one and thumbs upping the other issue to help us prioritize it. Thank you!\n\n";
                similarIssues.forEach(issue => {
                    message += `- [${issue.title} (#${issue.number})](${issue.html_url}),  score: ${issue.score.toFixed(2)}\n`;
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