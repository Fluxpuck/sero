/*  FluxBot © 2023 Fluxpuck
This file contains a ConsoleTable class to create and display tables in the console, 
along with functions to create event and command objects and display them in tables, 
and a function to display a welcome message with a startup timestamp in the console. */

// Define a function to display a welcome message in the console
function displayWelcomeMessage(client) {
    return console.log(`
    _______  ___      __   __  __   __ 
   |       ||   |    |  | |  ||  |_|  |
   |    ___||   |    |  | |  ||       |
   |   |___ |   |    |  |_|  ||       |
   |    ___||   |___ |       | |     | 
   |   |    |       ||       ||   _   |
   |___|    |_______||_______||__| |__|
         
   Startup > ${new Date().toUTCString()} 
   NODE_ENV > ${process.env.NODE_ENV}
   Client > ${client.user.tag}
`);
}

module.exports = { displayWelcomeMessage };