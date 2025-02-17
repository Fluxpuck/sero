async function deferInteraction(interaction,  = false) {
    if (!interaction) return false;

    try {
        if (interaction.deferred) return true;
        const defered = await interaction.deferReply({});
        return defered;
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Failed to defer interaction:', error);
        }
        return false;
    }
}

async function replyInteraction(interaction, options, timeout = 0) {
    if (!interaction || !options) return false;
    try {
        const response = interaction.deferred || interaction.replied
            ? await interaction.editReply(options)
            : await interaction.reply(options);

        if (timeout > 0) {
            setTimeout(async () => {
                try {
                    await interaction.deleteReply();
                } catch (error) {
                    if (process.env.NODE_ENV === 'development') {
                        console.error('Failed to delete interaction reply:', error);
                    }
                }
            }, timeout);
        }

        return response;
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Failed to reply to interaction:', error);
        }
        return false;
    }
}

async function updateInteraction(interaction, options) {
    if (!interaction || !options) return false;

    try {
        const update = await interaction.update(options);
        return update;
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Failed to update interaction:', error);
        }
        return false;
    }
}

async function followUpInteraction(interaction, options, deleteInteraction = true) {
    if (!interaction || !options) return false;

    try {
        if (deleteInteraction && interaction.deferred) {
            await interaction.deleteReply();
        }
        const response = await interaction.followUp(options);

        return response;
    } catch (error) {
        if (process.env.NODE_ENV === 'development') {
            console.error('Failed to follow up interaction:', error);
        }
        return false;
    }
}

module.exports = {
    deferInteraction,
    replyInteraction,
    updateInteraction,
    followUpInteraction
};