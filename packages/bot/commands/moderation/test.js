// required in commandName.js file
const { ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType } = require('discord.js');

const { findUser, findUsersFromName } = require("../../lib/resolvers/UserResolver");

const { createCustomEmbed } = require('../../assets/embed');
const { createCustomDropdown } = require('../../assets/embed-dropdowns');
const { ERROR, BASE_COLOR } = require('../../assets/embed-colors');

module.exports.props = {
    commandName: "test",
    description: "test command",
    usage: "/test [string]",
    interaction: {
        type: 1, // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandType
        permissionType: [], // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandPermissionType  
        options: [
            {
                name: "username",
                type: 3,
                description: "The user that you want to search for.",
                required: true
            }
        ], // → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType 
    }

}

module.exports.run = async (client, interaction) => {

	const userToSearch = interaction.options.getString('username', true);
	const member = await findUser(interaction.guild, userToSearch);

    const embed = createCustomEmbed({
        title: "Member Search"
    });

    let members;

    console.log(member);

    const fetchMemberByUserName = async (guild, userToSearch, fetchFromCache) => {
        return await findUsersFromName(guild, userToSearch, fetchFromCache);
    }

    // Interaction reply options
    const searchButton = new ButtonBuilder()
        .setCustomId('search')
        .setLabel(`Search for user \`${userToSearch}\``)
        .setStyle(ButtonStyle.Secondary)
        .setEmoji('🔍')
    
    const row = new ActionRowBuilder().addComponents(searchButton);

    if (!member) {
        
        embed.setDescription(`You searched for \`${userToSearch}\` but I couldn't find any users that match your search query. Click the search button to search for users that match your search query.`);

        const response = await interaction.reply({ 
            embeds: [embed], 
            components: [row],
        }).catch((error) => { return error; });

        const responseCollectorOptions = { componentType: ComponentType.Button, idle: 300_000, time: 3_600_000 };
        const responseCollector = response.createMessageComponentCollector({ responseCollectorOptions });

        responseCollector.on('collect', async i => {
            if (i.customId === 'search' && i.isButton()) {
                members = await fetchMemberByUserName(i.guild, userToSearch, false);

                if (!members || !members.size) {
                    embed.setDescription(`You searched for \`${userToSearch}\` but I couldn't find any users that match your search query.`);
                    embed.setColor(ERROR);

                    return await i.update({
                        embeds: [embed]
                    }).catch((error) => { return error; });
                }

                embed.setDescription(`You searched for ${userToSearch} and I've found ${members.size} users who match your search query. \n\`\`\`\n${members.map(m => m.user.username).join('\n')}\`\`\``);
                embed.setColor(BASE_COLOR);

                const memberListDropdown = members.map(m => ({
                    label: m.user.username,
                    description: `Get more info on ${m.user.username}`,
                    value: m.user.username
                }));

                await searchButton.setDisabled(true);

                return await i.update({
                    embeds: [embed],
                    components: [row]
                }).catch((error) => { return error; });

            } else if (i.customId === 'search' && i.isStringSelectMenu()) {
                console.log('select menu');
            }
        });

        // members = await fetchMemberByUserName(interaction.guild, userToSearch, false);

        // if (!members || !members.size) {
        //     embed.setDescription(`You searched for \`${userToSearch}\` but I couldn't find any users that match your search query.`);
        //     embed.setColor(ERROR);

        //     return interaction.reply({ embeds: [embed] });
        // }

        // embed.setDescription(`You searched for ${userToSearch} and I've found ${members.size} users who match your search query. \n\`\`\`\n${members.map(m => m.user.username).join('\n')}\`\`\``);

        // return interaction.reply({ embeds: [embed] });
    } else {
        embed.setDescription(`You searched for \`${userToSearch}\`, and found \`${member.user.username}\` which matches search query. \n\`\`\`\n• ${member.user.username}\`\`\``);
        embed.setFooter({text:'Not the user you were looking for? Click the search button to search for users that match your search query.', iconURL: interaction.guild.iconURL({ dynamic: true })});      
    
        interaction.reply({ embeds: [embed] });
    }

}