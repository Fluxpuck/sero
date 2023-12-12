const { ConfigFlags } = require("../../database/models");

module.exports.run = async () => {

    const configData = [
        {
            config: "applicationRefresh",
            value: true
        },
        {
            config: "applicationInitialize",
            value: true
        },
        {
            config: "saveFileCommands",
            value: true
        },
        {
            config: "saveClientGuilds",
            value: false
        },
    ]

    for (const configInfo of configData) {
        try {
            // Check if the config already exists
            const existingConfig = await ConfigFlags.findOne({
                where: { config: configInfo.config },
            });

            if (existingConfig) {
                // Config already exists, update its data
                // await existingConfig.update(configInfo);
            } else {
                // Config doesn't exist, create a new record
                // await ConfigFlags.create(configInfo);
            }
        } catch (error) {
            console.error(`Error creating/updating configuration: ${error.message}`);
        }
    }

}