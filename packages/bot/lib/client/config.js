const { getRequest } = require('../../database/connection');

async function fetchConfig(name) {
    try {
        // Update the endpoint URL based on the presence of commandId
        const endpoint = name ? `/config:${name}` : `/config`;
        // Make the getRequest with the updated endpoint
        const response = await getRequest(endpoint);
        if (response.status >= 200 && response.status <= 299) {

            const transformedData = {};
            response.data.forEach(item => {
                transformedData[item.config] = item.value;
            });

            return transformedData;
        } else {
            throw new Error(`Request failed with status ${response.status}`);
        }
    } catch (error) {
        console.error("fetchConfig", error);
    }
}

module.exports = { fetchConfig };