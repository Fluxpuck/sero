module.exports = {

    formatLogForEmbedFields: (log, inline = false) => {
        function embedLog(logEntry) {
            return {
                value: logEntry.value,
                field: logEntry.field,
                inline: inline
            };
        }

        // Assuming log is an array of log entries
        const embeddedFields = log.map(entry => embedLog(entry));
        return embeddedFields;

        
    }


}