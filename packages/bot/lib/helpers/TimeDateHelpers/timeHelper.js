const moment = require('moment');

module.exports = {
    /**
     * Format a time duration in milliseconds as a string in the format "<day(s)>d <hr>h <min>m <s>s".
     * If "full" is true, show singular/plural forms (e.g., "1 hour" or "2 hours").
     * @param {number} timeInMilliseconds - The time duration in milliseconds.
     * @param {boolean} [full=false] - Whether to show full unit names.
     */
    formatTime: (timeInMilliseconds, full = false) => {
        const units = [
            { label: ['day', 'days', 'd'], value: Math.floor(timeInMilliseconds / 86400000) },
            { label: ['hour', 'hours', 'h'], value: Math.floor(timeInMilliseconds / 3600000) % 24 },
            { label: ['minute', 'minutes', 'm'], value: Math.floor(timeInMilliseconds / 60000) % 60 },
            { label: ['second', 'seconds', 's'], value: Math.floor(timeInMilliseconds / 1000) % 60 }
        ];

        return units
            .filter(unit => unit.value > 0)
            .map(({ label, value }) => `${value}${full ? ` ${label[value === 1 ? 0 : 1]}` : label[2]}`)
            .join(' ')
            .trim();
    },

    /**
     * Get the duration in minutes between a timestamp and the current time.
     * @param {timestamp} timestamp - The timestamp to calculate the duration of. 
     * @returns {number} - The duration in minutes, rounded up.
     */
    calculateRoundedDuration: (timestamp) => {
        const newTimestamp = new Date(timestamp).getTime();
        const now = Date.now(); // Current time in milliseconds

        const differenceInMillis = Math.abs(now - newTimestamp); // Absolute difference
        const differenceInMinutes = Math.ceil(differenceInMillis / (1000 * 60));

        return differenceInMinutes;
    },

    /**
     * Check if a timestamp is older than 24 hours.
     * @param {timesamp} timestamp - The timestamp to check.
     * @returns - True if the timestamp is older than 24 hours, false otherwise.
     */
    isOlderThan24Hours: (timestamp) => {
        // Parse the timestamp into a JavaScript Date object
        const parsedTimestamp = new Date(timestamp);

        // Get the current time in milliseconds
        const currentTime = Date.now();

        // Calculate the difference in milliseconds between the timestamp and the current time
        const differenceInMilliseconds = currentTime - parsedTimestamp.getTime();

        // Check if the difference is greater than 24 hours (in milliseconds)
        return differenceInMilliseconds > (24 * 60 * 60 * 1000);
    },

    /**
     * Calculate the time left in hours and minutes from a given timestamp after adding 24 hours to it
     * @param {number} timestamp The timestamp in milliseconds
     * @returns {string} A string representing the time left in hours and minutes
     */
    timeLeftToNextDay: (timestamp) => {
        // Convert the timestamp to a Date object and add 24 hours
        const targetDate = new Date(timestamp);
        targetDate.setHours(targetDate.getHours() + 24);

        // Get the current date and time
        const currentDate = new Date();

        // Calculate the difference in milliseconds
        let difference = targetDate - currentDate;

        // Convert milliseconds to hours and minutes
        const hours = Math.floor(difference / (1000 * 60 * 60));
        difference -= hours * 1000 * 60 * 60;
        const minutes = Math.floor(difference / (1000 * 60));

        // Construct the time left string
        let timeLeftString = '';
        if (hours > 0) {
            timeLeftString += `${hours} hour${hours > 1 ? 's' : ''} `;
        }
        timeLeftString += `${minutes} minute${minutes > 1 ? 's' : ''}`;

        // Return the time left as a string
        return timeLeftString;
    },

    /**
     * Calculate the time left in hours and minutes from a given timestamp
     * @returns {string} - A string representing the time left in hours and minutes
     */
    getTimeUntilTomorrow: () => {
        // Get current date
        const currentDate = new Date();

        // Set time to 00:00:00 for tomorrow
        const tomorrow = new Date(currentDate);
        tomorrow.setDate(currentDate.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        // Calculate the difference in milliseconds between now and tomorrow
        const timeUntilTomorrow = tomorrow - currentDate;

        // Convert milliseconds to hours, minutes, and seconds
        const hours = Math.floor(timeUntilTomorrow / (1000 * 60 * 60));
        const minutes = Math.floor((timeUntilTomorrow % (1000 * 60 * 60)) / (1000 * 60));

        // Construct the time left string
        let timeLeftString = '';
        if (hours > 0) {
            timeLeftString += `${hours} hour${hours > 1 ? 's' : ''} `;
        }
        timeLeftString += `${minutes} minute${minutes > 1 ? 's' : ''}`;

        return timeLeftString;
    },

    /**
     * Check if a timestamp is from today or newer
     * @param {*} timestamp - The timestamp to check
     * @returns - True if the timestamp is from today or newer, false otherwise
     */
    isTimestampFromToday: (timestamp) => {
        // Get current date
        const currentDate = new Date();

        // Convert timestamp to Date object
        const dateFromTimestamp = new Date(timestamp);

        // Set current date time to midnight
        currentDate.setHours(0, 0, 0, 0);

        // Set date from timestamp time to midnight
        dateFromTimestamp.setHours(0, 0, 0, 0);

        // Calculate the difference in milliseconds between current date and date from timestamp
        const difference = dateFromTimestamp.getTime() - currentDate.getTime();

        // Check if the difference is greater than or equal to 0, meaning it's today or newer
        return difference >= 0;
    },

    /**
     * Get the time ago from a given date in seconds or minutes
     * @param {*} date - The date to calculate the time ago from
     * @returns - A string representing the time ago
     */
    getTimeAgo: (date) => {
        const timeDifferenceInSeconds = moment().diff(date, 'seconds');
        const timeDifferenceInMinutes = moment().diff(date, 'minutes');

        if (timeDifferenceInSeconds < 60) {
            return `${timeDifferenceInSeconds} second${timeDifferenceInSeconds === 1 ? '' : 's'} ago`;
        } else {
            return `${timeDifferenceInMinutes} minute${timeDifferenceInMinutes === 1 ? '' : 's'} ago`;
        }
    },

    /**
     * Get the time in milliseconds from a given timestamp
     * @param {*} time - The timestamp to convert
     * @returns - The time in milliseconds
     */
    unixTimestamp: (time = new Date()) => {
        const timestamp = Math.floor(time / 1000);
        return timestamp.toString();
    },

    /**
     * Get the years ago from a given date
     * @param {*} date - The date to calculate the years ago from
     * @returns - The years ago
     */
    getYearsAgo: (date) => {
        const timeDifferenceInYears = moment().diff(date, 'years');
        return timeDifferenceInYears;
    }
};