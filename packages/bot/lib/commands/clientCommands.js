const { postRequest, getRequest } = require('../../database/connection');


async function fetchCommands() {
    
    const commands = await getRequest("/client/commands")
    


}

module.exports = {  };