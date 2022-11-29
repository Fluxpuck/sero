/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */

// → Assets
// → Modules and Utilities
const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, Collection } = require('discord.js');
const { getMemberApplications, getMemberFromBL, saveMemberApplication } = require("../../database/QueryManager");
const { OlderThanTwoWeeks } = require('../../utils/functions');

module.exports.run = async (client, interaction) => {

    //if there is no apply channel setup
    if (!interaction.guild.applyId) return;

    //information from the interaction + setup status
    const { guild, member } = interaction;

    // → Application Filters & checks
    //check if last application is less than 2 weeks old...
    const memberApplications = await getMemberApplications(interaction.guild.id, member.user.id)
    const lastApplication = memberApplications.sort((a, b) => a.date - b.date)[0]
    if (OlderThanTwoWeeks(lastApplication.date) == false) return interaction.reply({
        content: `Oops, seems like you have already applied recently. Feel free to apply again in the future.`,
        ephemeral: true,
    }).catch(err => { });

    //check if member is blocked from applying...
    const memberBlocked = await getMemberFromBL(interaction.guild.id, member.user.id)
    if (memberBlocked.length > 0) return interaction.reply({
        content: `Sorry, but you can no longer apply`,
        ephemeral: true,
    }).catch(err => { });

    //check if application channel can be fetched
    const channel = await guild.channels.fetch(interaction.guild.applyId);
    if (!channel) return interaction.reply({
        content: `Sorry, could not fetch the application channel`,
        ephemeral: true,
    }).catch(err => { });

    // → Modal Input Field
    const modal = new ModalBuilder()
        .setCustomId('applicationForm')
        .setTitle(`Staff Application Form`)
        .addComponents([
            //age input
            new ActionRowBuilder().setComponents(
                new TextInputBuilder()
                    .setCustomId('_age')
                    .setLabel('Age')
                    .setPlaceholder('What is your age?')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(1)
                    .setMaxLength(2)),
            //region input
            new ActionRowBuilder().setComponents(
                new TextInputBuilder()
                    .setCustomId('_region')
                    .setLabel('Region')
                    .setPlaceholder('Where are you from?')
                    .setStyle(TextInputStyle.Short)
                    .setRequired(true)
                    .setMinLength(2)
                    .setMaxLength(50)),
            //reasoning input
            new ActionRowBuilder().setComponents(
                new TextInputBuilder()
                    .setCustomId('_reason')
                    .setLabel('Reason')
                    .setPlaceholder('Why do you want to become a moderator?')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setMinLength(10)
                    .setMaxLength(200)),
            //previous Experience input
            new ActionRowBuilder().setComponents(
                new TextInputBuilder()
                    .setCustomId('_experience')
                    .setLabel('Experience')
                    .setPlaceholder('If you have previous experience moderating, please elaborate.')
                    .setStyle(TextInputStyle.Paragraph)
                    .setRequired(true)
                    .setMinLength(2)
                    .setMaxLength(200)),
        ])

    //show modal to user
    await interaction.showModal(modal);

    // → Interact with the modal submittion
    await interaction.awaitModalSubmit({
        filter: async (i) => {
            //get all submitted answers, by each value
            const formAge = i.fields.fields.get('_age');
            const formRegion = i.fields.fields.get('_region');
            const formReason = i.fields.fields.get('_reason');
            const formExperience = i.fields.fields.get('_experience');

            // → Create thread and reply message
            channel.threads.create({
                name: `${member.user.username} Application`,
                autoArchiveDuration: 7 * 24 * 60, //one week archive duration
                type: 12,
                invitable: false,
                reason: `Application thread for ${member.user.username} - ${member.user.id}`,
            }).then(async threadChannel => {
                //add member to thread
                await threadChannel.members.add(member.user.id);

                //send message to thread
                threadChannel.send({
                    content: `
Hello <@${member.user.id}>. This is your private application thread, where your application process will continue.
Please be patient, a moderator will reply soon.

**Name**            -   \`${member.user.tag} - ${member.user.id}\`  \n
**Age**             -   \`${formAge.value} years old\`              \n
**Region**          -   \`${formRegion.value}\`                     \n
**Reason**          -   \`${formReason.value}\`                     \n
**Experience**      -   \`${formExperience.value}\`                 \n
                    `,
                    ephemeral: false
                }).catch(err => { });

                //save data to database
                const applicationData = { _age: formAge.value, _region: formRegion.value, _reason: formReason.value, _experience: formExperience.value }
                saveMemberApplication(interaction.guild.id, member, applicationData);

                //return message to the user
                return i.reply({
                    content: `A private application-thread has been opened for you! \n → <#${threadChannel.id}>`,
                    ephemeral: true
                }).catch(err => { });

            }).catch(async err => {
                return i.reply({
                    content: `Oops, something went wrong trying to create an application-thread for you`,
                    ephemeral: true
                })
            })
        }, time: 120000,
    }).catch(err => { });

    return;
}


//command information
module.exports.info = {
    command: {
        name: 'apply-for-mod',
        category: 'feature',
        desc: 'Apply',
        usage: '/apply-for-mod'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [ //type: Subcommand 1, SubcommandGroup 2, String 3, Integer 4, Boolean 5, User 6, Channel 7, Role 8, Mentionable 9, Number 10, Attachment 11
        ],
        modal: true,
        permission: [],
        defaultMemberPermissions: ['ManageGuild'],
        ephemeral: true
    }
}