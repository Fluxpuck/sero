const { postRequest, getRequest, deleteRequest } = require('../../database/connection');

async function fetchCommands(commandId) {
    try {
        // Update the endpoint URL based on the presence of commandId
        const endpoint = commandId ? `/client/commands/${commandId}` : `/client/commands`;
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
        // Set the enpoint URL to the commands endpoint
        const endpoint = `/client/commands`;
        // Make a postRequest to the commands endpoint	
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

async function deleteCommands(commandName) {
    try {
        // Get the endpoint URL based on the commandName
        const endpoint = `/client/commands/${commandName}`;
        // Make the deleteRequest with the updated endpoint
        const response = await deleteRequest(endpoint);

        // Check if response is defined before accessing its status
        if (response && response.status >= 200 && response.status <= 299) {
            return response.data;
        } else {
            throw new Error(`Request failed with status ${response ? response.status : 'unknown'}, ${response ? response.message : 'No response message'}`);
        }
    } catch (error) {
        console.error("deleteCommands", commandName, error)
    }
}

module.exports = { fetchCommands, postCommands, deleteCommands };