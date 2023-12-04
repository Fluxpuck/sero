const { postRequest, getRequest } = require('../../database/connection');

async function fetchCommands(commandId) {
    try {
        // Update the endpoint URL based on the presence of commandId
        const endpoint = commandId ? `/command:${commandId}` : `/commands`;
        // Make the getRequest with the updated endpoint
        const response = await getRequest(endpoint);
        if (response.status >= 200 && response.status <= 299) {
            return response.data;
        } else {
            throw new Error(`Request failed with status ${response.status}`);
        }
    } catch (error) {
        console.error("fetchCommands", error);
    }
}

async function postCommands(commandName, data) {
    try {
        // Update the endpoint URL based on the presence of commandId
        const endpoint = commandName ? `/commands/${commandName}` : `/command`;

        // Make the postRequest with the updated endpoint
        const response = await postRequest(endpoint, data);
        if (response.status >= 200 && response.status <= 299) {
            return response.data;
        } else {
            throw new Error(`Request failed with status ${response.status}`);
        }
    } catch (error) {
        console.error("postCommands", commandName, error);
    }
}

module.exports = { fetchCommands, postCommands };