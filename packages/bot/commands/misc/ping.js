/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit hyperbot.cc  */

// → Constructing the command and exporting
module.exports.run = async (client, interaction) => {

    // Set timer for message reply
    const wait = require('node:timers/promises').setTimeout;
    await wait(800); //wait before giving a reply

    // Reply with Discord Latency
    return interaction.reply(`Pong! → \ ${Math.round(client.ws.ping)}ms`)
        .catch((err) => { throw err });
}