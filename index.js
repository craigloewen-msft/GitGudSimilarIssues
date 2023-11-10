// Imports @actions/core npm library into core variable
const core = require('@actions/core');

try {
    // Get The Input Value of `who-to-greet`
    const nameToGreet = core.getInput('issuetitle');

    // Create a markdown message
    const message = `# Welcome to the repository, ${nameToGreet}!\n\nWe're glad you're here. Feel free to explore and contribute.`;

    // Prints The Value of nameToGreet in Github Action
    core.info(message);

    // Sets The Time As Output
    core.setOutput("message", message);
} catch (error) {
    core.setFailed(error.message);
}