module.exports = {

    // → Create Interactions

    /**
     * Create a new client interaction command
     * @param {Object} client - The Discord client object
     */
    async setClientInteraction(client, command) {
        if (!client) return;
        await client.application?.fetch();
        await client.application?.commands.create({
            name: command.name,
            description: command.description,
            type: command.interaction.type,
            options: command.interaction.options,
            defaultMemberPermissions: command.interaction.defaultMemberPermissions,
        });
    },

    /**
     * Creates a new guild interaction command
     * @param {Client} client - The Discord client instance.
     * @param {Guild} guild - The Discord guild to add the command to.
     * @param {Object} command - An object containing the command's name, description, options, and defaultMemberPermissions.
     */
    async setGuildInteraction(client, guild, command) {
        if (!client || !guild || !command) return;
        await client.application?.commands.create({
            name: command.name,
            description: command.description,
            type: command.interaction.type,
            options: command.interaction.options,
            defaultMemberPermissions: command.interaction.defaultMemberPermissions,
        }, guild.id);
    },


    // → Update Interactions

    /**
     * Updates the command with the given application data in the Discord application
     * @param {Object} client - The Discord client object
     * @param {Object} application - The data of the application to be updated
     */
    async updateClientInteraction(client, application) {
        if (!client || !application) return;
        const command = client.commands.get(application.name);
        await client.application?.commands.edit(application.id, {
            name: command.name,
            description: command.description,
            type: command.interaction.type,
            options: command.interaction.options,
            defaultMemberPermissions: command.interaction.defaultMemberPermissions,
        });
    },


    // → Remove Interactions

    /**
     * Removes the command with the given application data from the Discord application
     * @param {Object} client - The Discord client object
     * @param {Object} application - The data of the application to be removed
     */
    async removeClientCommand(client, application) {
        if (!client || !application) return;
        await client.application.commands.fetch(application.id)
            .then((command) => { command.delete() })
    }

}