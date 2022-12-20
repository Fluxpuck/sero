/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    The ClientManager contains all functions required for the bot client */

//require packages
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

    /** create client application commands
     * @param {*} client 
     */
    async setClientCommands(client) {
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
            }).catch(err => console.log('Oops, something went wrong creating all commands: ', err));
        }
    },

    /** add individual client application command
     * @param {*} client 
     * @param {*} commandFile 
     * @returns 
     */
    async addClientCommand(client, commandFile) {
        if (!commandFile) return;
        // insert application with client command details
        client.application.commands.create({
            name: commandFile.info.command.name,
            description: commandFile.info.command.desc,
            type: commandFile.info.slash.type,
            options: commandFile.info.slash.options,
            permission: commandFile.info.slash.permission,
            defaultMemberPermissions: commandFile.info.slash.defaultMemberPermissions
        }).catch(err => console.log('Oops, something went wrong creating the command: ', err));
    },

    /** update client application command
     * @param {*} client 
     * @param {*} application 
     * @returns 
     */
    async updateClientCommand(client, application) {
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
        }).catch(err => console.log('Oops, something went wrong editting all commands: ', err));
    },

    /** remove client application commands
     * @param {*} client 
     */
    async removeClientCommands(client) {
        await client.commands.fetch().then(async applications => {
            if (applications.size <= 0) return;
            return client.commands.set([]);
        }).catch(err => console.log('Oops, something went wrong removing all commands: ', err));
    },

    /** remove individual client application command
     * @param {*} client 
     * @param {*} application 
     */
    async deleteClientCommand(client, application) {
        if (!application) return;
        await client.commands.delete(application.id)
            .catch(err => console.log('Oops, something went wrong deleting the command: ', err));
        return console.log(`Application has been delete... ${application.id}`)
    },

    /** remove guild application commands
     * @param {*} guild 
     */
    async removeGuildCommands(guild) {
        await guild.commands.fetch().then(async applications => {
            if (applications.size <= 0) return;
            return guild.commands.set([]);
        }).catch(err => console.log('Oops, something went wrong removing all commands: ', err));
    },

    /** remove individual guild application command
     * @param {*} guild 
     * @param {*} commandName 
     */
    async deleteGuildCommand(guild, application) {
        if (!application) return;
        await guild.commands.delete(application.id)
            .catch(err => console.log('Oops, something went wrong deleting the command: ', err));
    },

    /** add individual guild application command
     * @param {*} client 
     * @param {*} guild 
     * @param {*} commandName 
     */
    async addGuildCommand(client, guild, commandFile) {
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

    /** filter and add custom guild commands
     * @param {*} client 
     * @param {*} guild 
     * @param {*} commandDetails 
     */
    async addCustomCommand(client, guild, commandDetails) {
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

        //insert application with client command details
        await client.application.commands.create({
            name: `${guild.prefix}${commandDetails.commandName}`,
            description: `Custom Command - ${commandDetails.commandName}`,
            type: 1,
            options: commandOptions,
        }, guild.id).catch(err => console.log('Oops, something went wrong creating the custom command: ', err));

    },

    /**
     * @param {*} client 
     * @param {*} guild 
     * @param {*} commandDetails 
     * @param {*} selectedCommand 
     */
    async updateCustomCommand(client, guild, commandDetails, selectedCommand) {
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

        //update application with client command details
        await client.application.commands.edit(selectedCommand.id, {
            name: `${guild.prefix}${commandDetails.commandName}`,
            description: `Custom Command - ${commandDetails.commandName}`,
            type: 1,
            options: commandOptions,
        }, guild.id).catch(err => console.log('Oops, something went wrong updating the custom command: ', err));

    },

    /** write away all client and application (guild) commands
     * @param {*} client 
     */
    async writeCommandsJSON(client, jsonArray = []) {
        //get all client command names
        const clientCommandNames = client.commands.map(c => c.info)
            //filter out 'private' and 'test' categories
            .filter(c => c.command.category != 'private')
            .map(c => c.command.name);

        //add all client command names to array
        for await (let command of clientCommandNames) { jsonArray.push({ name: command, value: command }) }
        if (jsonArray.length > 0) {
            //write to json file
            fs.writeFile('./config/commands.json', JSON.stringify(jsonArray), (err) => {
                if (err) console.log(err)
            })
        }

    },

}