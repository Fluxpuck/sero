/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */

// → Assets and configs
// → Modules, functions and utilities
const { UpdateGuildEconomyCreditsTable, UpdateGuildEconomyLogTable } = require("../../database/DbManager");
const { checkTableExistance, updateCompanyName } = require("../../database/QueryManager");
const { loadGuildFeatures } = require("../../utils/CacheManager");

//construct the command and export
module.exports.run = async (client, interaction) => {

    //check if there already is an economy database table 
    const economyCreditsDBname = `${interaction.guild.id}_economycredits`;
    const economyLogsDBname = `${interaction.guild.id}_economylogs`;

    //check if table is availabe
    const tableCheck = await checkTableExistance(economyCreditsDBname)

    //if no table has been found, create tables!
    if (tableCheck.length <= 0) {
        //create database tables for the economy feature
        await UpdateGuildEconomyCreditsTable(interaction.guild.id);
        await UpdateGuildEconomyLogTable(interaction.guild.id);

        //add economy to guilds feature-set
        loadGuildFeatures(interaction.guild);

        //return message to user
        return interaction.editReply({
            content: `Economy feature is now ready!`,
            ephemeral: true
        })

    } else {
        //return message to user
        return interaction.editReply({
            content: `*Economy is already live. If you want to reset the Economy, please use \`/resetEconomy\`.*`,
            ephemeral: true
        })
    }


}


//command information
module.exports.info = {
    command: {
        name: 'set-economy',
        category: 'ECONOMY',
        desc: 'Enable or RESET economy',
        usage: '/set-economy'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [ //type: Subcommand 1, SubcommandGroup 2, String 3, Integer 4, Boolean 5, User 6, Channel 7, Role 8, Mentionable 9, Number 10, Attachment 11
        ],
        modal: false,
        permission: [],
        defaultMemberPermissions: ['ManageGuild'],
        ephemeral: true
    }
}