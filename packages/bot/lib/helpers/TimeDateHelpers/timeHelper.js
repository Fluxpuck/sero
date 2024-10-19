const { intervalToDuration, formatDuration, startOfTomorrow,
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
        const duration = intervalToDuration({ start: 0, end: timeInMilliseconds });

        const format = full ?
            ['days', 'hours', 'minutes', 'seconds'] :
            ['d', 'h', 'm', 's'];

        return formatDuration(duration, {
            format,
            zero: false,
            delimiter: ' ',
        }).trim();
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
    }

};