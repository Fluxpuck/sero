/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    The ClientManager contains all functions required for the bot client */

//require packages
const { ApplicationCommandPermissionType } = require('discord.js');
const fs = require('fs');

//check if filepath is a directory
function isDir(filePath) {
    return (fs.existsSync(filePath) && fs.lstatSync(filePath).isDirectory())
}

module.exports = {

    /** setup client Activity status
     * @param {Collection} client 
     */
    async setClientActivity(client) {
        // Set the client user's presence
        client.user.setPresence({ activities: [{ type: 'LISTENING', name: 'Fluxpuck#0001' }], status: 'online' });
    },

    /** go through all folders and setup client commands
     * @param {String} filePath 
     * @param {String} options 
     */
    async getClientCommands(filePath, options = {}) {

        if (!options.hasOwnProperty("dealerFunction")) Object.assign(options, { dealerFunction: 0 })
        if (!options.hasOwnProperty("initialDirectoryCheck")) Object.assign(options, { initialDirectoryCheck: true })
        if (!options.hasOwnProperty("print")) Object.assign(options, { print: false })

        if (options.dealerFunction == 0 && options.print == false) throw new Error(`No file dealer function provided`)
        if (typeof (options.dealerFunction) != "function" && options.print == false) throw new Error(`Dealer function provided is not a function`)

        let initCheck = isDir(filePath)

        if (options.initialDirectoryCheck && !initCheck) throw new Error(`File path provided (${filePath}) is not a folder / directory.`)

        if (initCheck) //checks whether the path is a folder
        {
            fs.readdirSync(filePath).forEach(file_in_folder => { // Through each file in the folder
                let new_path = `${filePath}/${file_in_folder}` // Construct a new path
                let secondaryCheck = isDir(new_path)
                if (secondaryCheck) module.exports.getClientCommands(new_path, { dealerFunction: options.dealerFunction, initialDirectoryCheck: false, print: options.print })
                else {
                    if (options.print) console.log(new_path)
                    else options.dealerFunction(new_path)
                }
            })
        }
        else //if not, fileLoader
        {
            if (options.print) console.log(filePath)
            else options.dealerFunction(filePath)
        }

    },

    /** register all application (guild) commands
     * @param {Collection} client
     * @param {Collection} guild 
     */
    async setSlashCommands(client, guild) {
        await client.application?.fetch();
        //go over all commands and register them
        for await (let command of client.commands.values()) {
            client.application.commands.create({
                name: command.info.command.name,
                description: command.info.command.desc,
                type: command.info.slash.type,
                options: command.info.slash.options,
                permission: command.info.slash.permission,
                defaultMemberPermissions: command.info.slash.defaultMemberPermissions
            }, guild.id).catch(err => console.log('Oops, something went wrong creating all commands: ', err));
        }
    },

    /** update all application (guild) commands
     * @param {Collection} client
     * @param {Collection} guild 
     */
    async updateSlashCommands(client, guild) {
        await guild.commands.fetch().then(async applications => {
            //go over all commands and update them
            for await (let application of applications.values()) {
                //get client command and update application
                const commandFile = client.commands.get(application.name);
                if (!commandFile) return;
                //update application with client command details
                client.application.commands.edit(application.id, {
                    name: commandFile.info.command.name,
                    description: commandFile.info.command.desc,
                    type: commandFile.info.slash.type,
                    options: commandFile.info.slash.options,
                    defaultMemberPermissions: commandFile.info.slash.defaultMemberPermissions,
                }, [guild.id]).catch(err => console.log('Oops, something went wrong editting all commands: ', err));
            }
        })
    },

    /** remove all application (guild) commands
     * @param {*} guild 
     */
    async removeSlashCommands(guild) {
        await guild.commands.fetch().then(async applications => {
            if (applications.size <= 0) return;
            return guild.commands.set([]);
        }).catch(err => console.log('Oops, something went wrong removing all commands: ', err));
    },

    /** insert individual (guild) command
     * @param {*} client 
     * @param {*} guild 
     * @param {*} commandName 
     */
    async addSlashCommand(client, guild, commandFile) {
        if (!commandFile) return;
        // insert application with client command details
        client.application.commands.create({
            name: commandFile.info.command.name,
            description: commandFile.info.command.desc,
            type: commandFile.info.slash.type,
            options: commandFile.info.slash.options,
            permission: commandFile.info.slash.permission,
            defaultMemberPermissions: commandFile.info.slash.defaultMemberPermissions
        }, guild.id).catch(err => console.log('Oops, something went wrong creating the command: ', err));
    },

    /** filter and add all custom command details
     * @param {*} client 
     * @param {*} guild 
     * @param {*} commandDetails 
     */
    async addSlashCustomCommand(client, guild, commandDetails) {

        //fetch command permission roles 
        const savedRoles = commandDetails.commandPerms != null ? commandDetails.commandPerms.split(',') : []
        var commandPerms = []

        //setup the command permissions
        savedRoles.forEach(roleId => {
            commandPerms.push({
                id: roleId,
                type: 1, //Role 1, User 2, Channel 3
                permission: true
            })
        });

        //check for {mention}, add option
        var commandOptions = []
        if (commandDetails.commandResponse.includes('{mention}')) {
            commandOptions.push({
                name: 'user',
                type: 6,
                description: 'Choose a member to mention',
                required: true
            })
        }

        // insert application with client command details
        await client.application.commands.create({
            name: commandDetails.commandName,
            description: `Custom Command - ${commandDetails.commandName}`,
            type: 1,
            options: commandOptions,
            permission: commandPerms,
        }, guild.id).catch(err => console.log('Oops, something went wrong creating the custom command: ', err));

    },

    /**
     * @param {*} client 
     * @param {*} guild 
     */
    async updateSlashCustomCommands(client, guild) {

        //...

    },

    /** remove individual (guild) command
     * @param {*} guild 
     * @param {*} commandName 
     */
    async delSlashCommand(guild, application) {
        if (!application) return;
        await guild.commands.delete(application.id)
            .catch(err => console.log('Oops, something went wrong deleting the command: ', err));
    },

    /** write away all client and application (guild) commands
     * @param {*} client 
     */
    async writeCommandsJSON(client) {
        //get all client command names
        const clientCommandNames = client.commands.map(c => c.info)
            //filter out 'private' and 'test' categories
            .filter(c => c.command.category != 'private' && c.command.category != 'test')
            .map(c => c.command.name);

        //JSON Array
        var jsonArray = []
        for await (let command of clientCommandNames) { jsonArray.push({ name: command, value: command }) }

        //write to json file
        fs.writeFile('./config/commands.json', JSON.stringify(jsonArray), (err) => {
            if (err) console.log(err)
        })
    },

}