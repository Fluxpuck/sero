const { readdirSync } = require('fs');
const { join } = require('path');

module.exports.run = (client) => {

    //set directory path to events and read files
    const filePath = join(__dirname, '..', 'events');
    const eventFiles = readdirSync(filePath);

    // Loop through each file in the events directory
    for (const file of eventFiles) {
        // Load the event from the file
        const event = require(`${filePath}/${file}`);
        // Get the name of the event from the file name
        const eventName = file.split('.').shift();

        // Bind the event to the client
        client.on(eventName, event.bind(null, client));
        // Add the event to the client's events collection
        client.events.set(eventName, { name: eventName, file: file });
    }

}