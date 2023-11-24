function displayWelcomeMessage(client) {
    return console.log(`
     _______ _______ _______   _______ 
    |       |       |    _  \\ |       |
    |  _____|    ___|   | |  ||   _   |
    | |_____|   |___|   |_| /_|  | |  |
    |_____  |    ___|    __   |  |_|  |
     _____| |   |___|   |  |  |       |
    |_______|_______|___|  |__|_______|

    Discord bot - Startup details:
    > ${new Date().toUTCString()}
    > NODE_ENV: ${process.env.NODE_ENV}
    > ${client.user.tag}
`);
}

module.exports = { displayWelcomeMessage };