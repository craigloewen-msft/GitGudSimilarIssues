// Import required libraries
const core = require('@actions/core');
const axios = require('axios');

try {
    // Get the input values
    const issueTitle = core.getInput('issueTitle') || core.getInput('issuetitle');
    const repo = core.getInput('repo') || core.getInput('repository');
    const similarityTolerance = parseFloat(core.getInput('similarityTolerance') || core.getInput('similaritytolerance'));
    const commentBody = core.getInput('commentBody') || core.getInput('commentbody');

    core.info("Comment body: " + commentBody);
    core.info("Similarity tolerance" + similarityTolerance);

    if (similarityTolerance == null || similarityTolerance === 0 || isNaN(similarityTolerance)) {
        core.setFailed("Invalid distance tolerance");
    }

    // Construct the API URL
    const issueTitleEncoded = encodeURIComponent(issueTitle);
    const url = `https://gitgudissues.azurewebsites.net/api/getsimilarissues/${repo}/${issueTitleEncoded}`;

    core.info(`Querying URL: ${url}`);

    // Send a GET request to the API
    axios.get(url).then(response => {
        // Check if success is false
        if (response.data.success === false) {
            core.info(JSON.stringify(response.data, null, 2));
            core.setFailed("API request was not successful");
        } else {
            // Filter the similarIssues array
            const similarIssues = response.data.similarIssues
                .filter(issue => issue.score >= similarityTolerance)
                .sort((a, b) => b.score - a.score);

            core.info("Similar issues:");
            core.info(JSON.stringify(similarIssues, null, 2));
            core.info("All issues:");
            core.info(JSON.stringify(response.data.similarIssues, null, 2));

            // Check if the filtered array has a length of 0
            if (similarIssues.length === 0) {
                core.warning("No similar issues found");
                core.setOutput("message", '');
            } else {
                // Format the output message
                let message = commentBody + "\n\n";

                // Add the open issues to the message
                const openIssues = similarIssues.filter(issue => issue.state === 'open');
                if (openIssues.length > 0) {
                    message += "### Open similar issues:\n\n";
                    openIssues.forEach(issue => {
                        message += `- [${issue.title} (#${issue.number})](${issue.html_url}),  similarity score: ${issue.score.toFixed(2)}\n`;
                    });
                }

                // Add the closed issues to the message
                const closedIssues = similarIssues.filter(issue => issue.state === 'closed');
                if (closedIssues.length > 0) {
                    message += "\n### Closed similar issues:\n";
                    closedIssues.forEach(issue => {
                        message += `- [${issue.title} (#${issue.number})](${issue.html_url}),  similarity score: ${issue.score.toFixed(2)}\n`;
                    });
                }


                message += "\n> Note: You can give me feedback by thumbs upping or thumbs downing this comment.";

                // Set the output message
                core.info("Output message:");
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