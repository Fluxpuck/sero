const { ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');

// SelectMenuOptions → https://discord-api-types.dev/api/discord-api-types-v10/interface/APISelectMenuOption
// StringSelectComponent Object → https://discord-api-types.dev/api/discord-api-types-v10/interface/APIStringSelectComponent

module.exports = {
    createCustomDropdown({
        customId = 1,
        placeholder = "placeholder",
        options = []
    }) {

        const dropdownMenu = new StringSelectMenuBuilder()
            .setCustomId(customId)
            .setPlaceholder(placeholder)

        if (options && Array.isArray(options)) {
            options?.forEach((option) => {
                dropdownMenu.addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel(option?.label)
                        .setDescription(option?.description)
                        .setValue(option?.value)
                )
            });
        }

        return dropdownMenu;
    }
}