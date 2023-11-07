module.exports.details = {

}

module.exports.run = async (client, interaction) => {

    // Set timer for message reply
    const wait = require('node:timers/promises').setTimeout;
    await wait(800); //wait before giving a reply

    // Reply with Discord Latency
    return interaction.reply(`Pong! → \ ${Math.round(client.ws.ping)}ms`)
        .catch((err) => { throw err });
}