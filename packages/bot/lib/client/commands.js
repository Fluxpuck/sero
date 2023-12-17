const { postRequest, getRequest } = require('../../database/connection');

async function fetchCommands(commandId) {
    try {
        // Update the endpoint URL based on the presence of commandId
        const endpoint = commandId ? `/commands/${commandId}` : `/commands`;
        // Make the getRequest with the updated endpoint
        const response = await getRequest(endpoint);

        // Check if response is defined before accessing its status
        if (response && response.status >= 200 && response.status <= 299) {
            return response.data;
        } else {
            return [];
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

        // Check if response is defined before accessing its status
        if (response && response.status >= 200 && response.status <= 299) {
            return response.data;
        } else {
            throw new Error(`Request failed with status ${response ? response.status : 'unknown'}, ${response ? response.message : 'No response message'}`);
        }
    } catch (error) {
        console.error("postCommands", commandName, error);
    }
}

module.exports = { fetchCommands, postCommands };