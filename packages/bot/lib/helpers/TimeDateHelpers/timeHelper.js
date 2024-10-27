const { intervalToDuration, formatDuration, startOfTomorrow, format,
    formatDistanceToNowStrict, getUnixTime, parse, differenceInYears
} = require('date-fns');

module.exports = {

    /**
     * Format a date to a string
     * @param {*} timeInMilliseconds 
     * @param {*} full 
     * @returns 
     */
    formatTime: (timeInMilliseconds, full = false) => {
        // Convert to number and ensure positive
        const ms = Math.abs(Number(timeInMilliseconds));

        // Calculate each unit
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        // Get remainders
        const remainderHours = hours % 24;
        const remainderMinutes = minutes % 60;
        const remainderSeconds = seconds % 60;

        // Build the parts array
        const parts = [];

        if (days > 0) {
            parts.push(`${days}${full ? ' days' : 'd'}`);
        }
        if (remainderHours > 0) {
            parts.push(`${remainderHours}${full ? ' hours' : 'h'}`);
        }
        if (remainderMinutes > 0) {
            parts.push(`${remainderMinutes}${full ? ' minutes' : 'm'}`);
        }
        if (remainderSeconds > 0 || parts.length === 0) {
            parts.push(`${remainderSeconds}${full ? ' seconds' : 's'}`);
        }

        return parts.join(' ');
    },

    /**
     * Get the time until tomorrow
     * @returns 
     */
    getTimeUntilTomorrow: () => {
        const now = new Date();
        const tomorrow = startOfTomorrow();

        const duration = intervalToDuration({ start: now, end: tomorrow });

        return formatDuration(duration, {
            format: ['hours', 'minutes'],
            zero: false,
            delimiter: ' ',
        }).trim();
    },

    /**
     * Get the Time Ago from a given date
     * @param {*} date 
     * @returns 
     */
    getTimeAgo: (date) => {
        return formatDistanceToNowStrict(new Date(date), { addSuffix: true });
    },

    /**
     * Get the time in milliseconds from a given timestamp
     * @param {*} time - The timestamp to convert
     * @returns - The time in milliseconds
     */
    unixTimestamp: (time = new Date()) => {
        const timestamp = getUnixTime(time);
        return timestamp.toString();
    },

    /**
     * calculate the age based on
     * a date string or date object with year, month, day
     * @param {*} input 
     * @returns 
     */
    calculateAge(input) {
        const birthDate = typeof input === 'string'
            ? parse(input, 'yyyy-MM-dd', new Date())
            : new Date(input.year, input.month - 1, input.day);

        if (isNaN(birthDate.getTime())) {
            throw new Error('Invalid date input');
        }

        return differenceInYears(new Date(), birthDate);
    },

    /**
     * Get the birthdate in a formatted string
     * @param {*} day
     * @param {*} month
     * @param {*} year
     */
    getBirthdate(day, month, year) {
        const date = new Date(year ? year : 1900, month - 1, day);

        const dateFormat = year ? 'do MMMM yyyy' : 'do MMMM';

        const currentYear = new Date().getFullYear();
        const age = year ? currentYear - year : null;

        return {
            date: format(date, dateFormat),
            age: age >= 13 ? age : null,
        };
    },

};