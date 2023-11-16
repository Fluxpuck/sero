const { postRequest, getRequest } = require('../../database/connection');

async function fetchCommands(commandId) {
    try {
        // Update the endpoint URL based on the presence of commandId
        const endpoint = commandId ? `/client/command:${commandId}` : `/client/commands`;
        // Make the getRequest with the updated endpoint
        const response = await getRequest(endpoint);
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(`Request failed with status ${response.status}`);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function postCommands(commandId, data) {

    console.log(data)

    try {
        // Update the endpoint URL based on the presence of commandId
        const endpoint = commandId ? `/client/command:${commandId}` : `/client/command`;
        // Make the postRequest with the updated endpoint
        const response = await postRequest(endpoint, data);
        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(`Request failed with status ${response.status}`);
        }
    } catch (error) {
        console.error("Error posting data:", error);
    }
}

module.exports = { fetchCommands, postCommands };