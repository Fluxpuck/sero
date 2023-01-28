/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License
    For more information on the commands, please visit fluxpuck.com  */

// → Assets and configs
const { work_success, work_failed, work_not_complete, work_timeout } = require('../../assets/messages.json');
// → Modules, functions and utilities
const { getMemberCreditsBalance, getMemberEconomyLogs, createEconomyLog, giveMemberCredits } = require("../../database/QueryManager")
const moment = require("moment/moment");

//construct the command and export
module.exports.run = async (client, interaction) => {

    //setup success or fail messages
    let id_work_success = Math.floor(Math.random() * work_success.length);
    let id_work_failed = Math.floor(Math.random() * work_failed.length);
    let id_work_timeout = Math.floor(Math.random() * work_timeout.length);

    //get balance from database
    const memberBalance = await getMemberCreditsBalance(interaction.guild.id, interaction.user.id);
    if (memberBalance === false) return interaction.editReply({
        content: `*Oops, looks like you haven't registered yet. Please use \`/register-work\` to start your journey.*`,
        ephemeral: true
    })

    //get member's work economy logs
    const memberLog = await getMemberEconomyLogs(interaction.guild.id, interaction.user.id, exports.info.command.name)
    const lastMemberLog = memberLog[memberLog.length - 1];

    //setup the timestamps of current date and last member log's creation date
    let currentTime = moment(), timestampToCheck = moment(lastMemberLog.create_date);
    let differenceInMinutes = currentTime.diff(timestampToCheck, 'minutes');

    //if the timestamp is younger than 60 minutes
    let id_work_not_complete = Math.floor(Math.random() * work_not_complete.length);
    if (differenceInMinutes < 60) return interaction.editReply({
        content: `${work_not_complete[id_work_not_complete].replace('{time}', `**${60 - differenceInMinutes}**`)}`,
        ephemeral: false
    })

    //get all logs from today...
    const todayLogs = memberLog.filter((log, index) => {
        return Boolean((new Date() - new Date(log.create_date) < 86400 * 1000));
    });

    //if someone has already worked 5 times in the past 24 hours... refuse!
    if (todayLogs.length > 5) return interaction.editReply({
        content: `${work_timeout[id_work_timeout]}`,
        ephemeral: false
    })

    //calculate & randomize what someone can earn based on: Account Age, Company, 
    const amount = Math.floor(Math.random() * 2000) + 100; //minimum (+) 100, maximum (*) 2000

    //setup successrate and generate of the job will be successfull
    const successRate = 0.4;
    const jobSuccess = Math.random() < successRate ? true : false;
    if (jobSuccess === true) {

        //give member credits based on work calculation
        await giveMemberCredits(interaction.guild.id, interaction.user.id, amount);
        //save to economy log to database
        await createEconomyLog(interaction.guild.id, exports.info.command.name, interaction.user, { old: memberBalance, new: (memberBalance + amount) })

        //return message
        return interaction.editReply({
            content: `${work_success[id_work_success].replace('{amount}', `**$${new Intl.NumberFormat().format(amount)}**`)}`,
            ephemeral: false
        })
    }

    if (jobSuccess === false) return interaction.editReply({
        content: `${work_failed[id_work_failed].replace('{amount}', `**$${new Intl.NumberFormat().format(amount)}**`)}`,
        ephemeral: false
    })

    return;

}


//command information
module.exports.info = {
    command: {
        name: 'work',
        category: 'ECONOMY',
        desc: 'Go to work and earn credits',
        usage: '/work'
    },
    slash: {
        type: 1, //ChatInput 1, User 2, Message 3
        options: [ //type → https://discord-api-types.dev/api/discord-api-types-v10/enum/ApplicationCommandOptionType
        ],
        modal: false,
        permission: [],
        defaultMemberPermissions: ['ManageGuild'],
        ephemeral: false
    }
}