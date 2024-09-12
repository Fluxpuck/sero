var cron = require('node-cron'); // https://www.npmjs.com/package/node-cron
const { getRequest } = require("../database/connection");

module.exports = (client) => {

    /**
     * Description...
     * @schedule - every 10 seconds
     */
    cron.schedule('*/10 * * * * *', () => {

    });


    /**
     * Execute a XP reward drop randomly every hour
     * @schedule - every hour / 0 * * * *
     */
    cron.schedule('*/10 * * * * *', async () => {

        // Fetch all the guilds that have exp-reward-drops enabled
        const dropGuilds = await getRequest('/guilds/drops/exp-reward-drops');
        if (dropGuilds?.status !== 200 || !dropGuilds?.data) return;

        // Loop through each guild and drop the reward
        for await (dropData of dropGuilds?.data) {

            // const MIN_HOUR = 5 * 60 * 1000; // 5 minutes in milliseconds
            // const MAX_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds
            const MIN_HOUR = 0; // 0 minutes in milliseconds
            const MAX_HOUR = 60 * 1000; // 1 minute in milliseconds

            // Calculate a random delay between MIN_HOUR and MAX_HOUR
            const randomDelay = Math.floor(Math.random() * (MAX_HOUR - MIN_HOUR)) + MIN_HOUR;

            if (process.env.NODE_ENV === "development") {
                // Calculate minutes and seconds from randomDelay
                const minutes = Math.floor(randomDelay / 60000);
                const seconds = Math.floor((randomDelay % 60000) / 1000);

                // Log the time in minutes and seconds format
                console.log("\x1b[35m", `XP Reward will drop in ${minutes > 0 ? minutes + ' minute(s) and ' : ''}${seconds} second(s).`);
            }

            // Execute the job
            setTimeout(() => {
                // Emit the dropReward event
                client.emit('dropReward', dropData);
            }, randomDelay);

        }
    });

}