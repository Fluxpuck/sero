/*  FluxBot © 2023 Fluxpuck
This file contains a ConsoleTable class to create and display tables in the console, 
along with functions to create event and command objects and display them in tables, 
and a function to display a welcome message with a startup timestamp in the console. */

// Define a class to display data in a console table
class ConsoleTable {
    constructor(header, data) {
        this.header = header; // The column names for the table
        this.data = data; // The data to display in the table
    }

    display() {
        console.table(this.data, this.header); // Display the data in a console table
    }
}

// Define a function to create an object representing an event
function createEventObject(event) {
    return { eventName: event.name, eventFile: event.file }; // Return an object with event name and file properties
}

// Define a function to create an object representing a command
function createCommandObject(file) {
    const command = file.info.command; // Get the command information from the file
    return { commandName: command.name, commandCategory: command.category }; // Return an object with command name and category properties
}

// Define a function to display a table of events
function displayEventTable(events) {
    const header = ['Event Name', 'Event File']; // Define the column names for the table
    const data = events.map(createEventObject); // Convert each event to an object with event name and file properties
    const consoleTable = new ConsoleTable(header, data); // Create a new console table with the header and data
    consoleTable.display(); // Display the table in the console
}

// Define a function to display a table of commands
function displayCommandTable(commands) {
    const header = ['Command Name', 'Command Category']; // Define the column names for the table
    const data = commands.map(createCommandObject); // Convert each command to an object with command name and category properties
    const consoleTable = new ConsoleTable(header, data); // Create a new console table with the header and data
    consoleTable.display(); // Display the table in the console
}

// Define a function to display a welcome message in the console
function displayWelcomeMessage() {
    return console.log(`
    _______  ___      __   __  __   __ 
   |       ||   |    |  | |  ||  |_|  |
   |    ___||   |    |  | |  ||       |
   |   |___ |   |    |  |_|  ||       |
   |    ___||   |___ |       | |     | 
   |   |    |       ||       ||   _   |
   |___|    |_______||_______||__| |__|
         
  Startup > ${new Date().toUTCString()}`) // Display a welcome message with the current date and time in UTC
}


module.exports = {
    displayEventTable,
    displayCommandTable,
    displayWelcomeMessage
};