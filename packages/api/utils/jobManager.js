var cron = require('node-cron');

/**
 * Example of a cron job
 * @schedule - every 1 minutes
 */
cron.schedule('* * * * * ', () => {
    return;
});