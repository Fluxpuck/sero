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

        const messageEmbed = new EmbedBuilder();

        try {
            if (typeof title !== 'undefined') messageEmbed.setTitle(title);
            if (typeof description !== 'undefined') messageEmbed.setDescription(description);
            if (typeof url !== 'undefined') messageEmbed.setURL(url);
            if (typeof thumbnail !== 'undefined') messageEmbed.setThumbnail(thumbnail);
            if (typeof timestamp !== 'undefined') messageEmbed.setTimestamp(timestamp);
            if (typeof color !== 'undefined') messageEmbed.setColor(color);
            if (typeof image !== 'undefined') messageEmbed.setImage(image);

            if (author && typeof author === 'object') {
                const authorName = author.name ?? null;
                const authorIconURL = author.iconURL ?? null;
                const authorURL = author.url ?? null;
                messageEmbed.setAuthor({ name: authorName, iconURL: authorIconURL, url: authorURL });
            }

            if (footer && typeof footer === 'object') {
                const footerText = footer.text ?? null;
                const iconURL = footer.iconURL ?? null;
                messageEmbed.setFooter({ text: footerText, iconURL: iconURL });
            }

            if (fields && Array.isArray(fields)) {
                fields.forEach((field) => {
                    if (field?.name && field?.value) {
                        messageEmbed.addFields(field);
                    }
                });
            }
        } catch (error) {
            console.log(error);
            // Handle error: Maybe return a default embed or send an error message
        }

        return messageEmbed;

    }
}