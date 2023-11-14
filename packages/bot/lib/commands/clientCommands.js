const { postRequest, getRequest } = require('../../database/connection');

async function fetchCommands(url) {
    try {
        const response = await getRequest(url);

        if (response.status === 200) {
            return response.data;
        } else {
            throw new Error(`Request failed with status ${response.status}`);
        }
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

async function postCommands(url, command) {
    try {
        const response = await postRequest(`/client/command`, {

        })

    } catch (error) {

    }
}

module.exports = { fetchCommands, postCommands };