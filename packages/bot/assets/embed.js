const { EmbedBuilder } = require('discord.js');
const ClientEmbedColors = require('./embed-colors');

module.exports = {
    createCustomEmbed({
        title,
        description,
        author,
        url,
        thumbnail,
        timestamp,
        color = ClientEmbedColors.BASE_COLOR,
        image,
        fields = [],
        footer
    }) {

        const messageEmbed = new EmbedBuilder()
        if (title) messageEmbed.setTitle(title);
        if (description) messageEmbed.setDescription(description);
        if (author) messageEmbed.setAuthor(author?.name, author?.iconURL, author?.url);
        if (url) messageEmbed.setURL(url);
        if (thumbnail) messageEmbed.setThumbnail(thumbnail);
        if (timestamp) messageEmbed.setTimestamp(timestamp);
        if (color) messageEmbed.setColor(color);
        if (image) messageEmbed.setImage(image);
        if (footer) messageEmbed.setFooter(footer?.text, footer?.iconURL);

        if (fields && Array.isArray(fields)) {
            fields.forEach((field) => {
                if (field?.name && field?.value) {
                    messageEmbed.addFields(field);
                }
            });
        }

        return messageEmbed;
    }
}