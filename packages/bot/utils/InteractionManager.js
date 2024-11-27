const { CommandInteraction, InteractionReplyOptions } = require('discord.js');

/**
 * Manages Discord interaction responses
 * @module InteractionManager
 */
async function deferInteraction(interaction, ephemeral = false) {
    if (!interaction) return false;

    try {
        if (interaction.deferred) return true;
        await interaction.deferReply({ ephemeral });
        return true;
    } catch (error) {
        console.error('Failed to defer interaction:', error);
        return false;
    }
}

async function replyInteraction(interaction, options) {
    if (!interaction || !options) return false;
    try {
        const response = interaction.deferred || interaction.replied
            ? await interaction.editReply(options)
            : await interaction.reply(options);
        return response;
    } catch (error) {
        console.error('Failed to reply to interaction:', error);
        return false;
    }
}

async function updateInteraction(interaction, options) {
    if (!interaction || !options) return false;

    try {
        await interaction.update(options);
        return true;
    } catch (error) {
        console.error('Failed to update interaction:', error);
        return false;
    }
}

async function followUpInteraction(interaction, options, deleteInteraction = true) {
    if (!interaction || !options) return false;

    try {
        if (deleteInteraction && interaction.replied) {
            await interaction.deleteReply();
        }
        const response = await interaction.followUp(options);
        return response;
    } catch (error) {
        console.error('Failed to follow up interaction:', error);
        return false;
    }
}

module.exports = {
    deferInteraction,
    replyInteraction,
    updateInteraction,
    followUpInteraction
};