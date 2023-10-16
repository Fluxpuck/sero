const { Client } = require("../../database/models");

module.exports.run = async () => {

    const clientData = [
        {
            clientId: "986544396298240071",
            clientName: "Fluxbot"
        }
    ]

    for (const clientInfo of clientData) {
        try {
            // Check if the guild already exists
            const existingGuild = await Client.findOne({
                where: { clientId: clientInfo.clientId },
            });

            if (existingGuild) {
                // Guild already exists, update its data
                await existingGuild.update(clientInfo);
            } else {
                // Guild doesn't exist, create a new record
                await Client.create(clientInfo);
            }
        } catch (error) {
            console.error(`Error creating/updating client: ${error.message}`);
        }
    }

}