const { readdirSync, statSync } = require('fs');
const { join, basename, extname } = require('path');

// Define the middleware function
let middleware = (event, data, next) => {
    next();
};

module.exports.run = (client) => {

    // Define the path to the events directory
    const filePath = join(__dirname, '..', 'events');

    // Function to get all files in a directory
    function getAllFiles(dirPath, arrayOfFiles) {
        // Read all files in the directory
        const files = readdirSync(dirPath);
        arrayOfFiles = arrayOfFiles || [];
        // Loop through each file in the directory
        files.forEach((file) => {
            if (statSync(join(dirPath, file)).isDirectory()) {
                arrayOfFiles = getAllFiles(join(dirPath, file), arrayOfFiles);
            } else {
                arrayOfFiles.push(join(dirPath, file));
            }
        });

        return arrayOfFiles;
    }

    // Get all files in the events directory
    const eventFiles = getAllFiles(filePath);

    // Loop through each file in the events directory
    for (const file of eventFiles) {
        // Load the event from the file
        const event = require(file);
        // Get the name of the event from the file name
        const eventName = basename(file, extname(file));

        // Bind the event to the client and call middleware
        client.on(eventName, (...args) => {
            middleware(eventName, args, () => {
                event(client, ...args);
            });
        });

        // Log the command to the console if in development mode
        if (process.env.NODE_ENV === "development") {
            console.log("\x1b[2m", `[Client]: Initialized ${eventName} event`);
        }

        // Add the event to the client's events collection
        client.events.set(eventName, { name: eventName, file: file });
    }
}

// Add middleware to the event manager 
module.exports.use = (fn) => {
    middleware = fn;
};