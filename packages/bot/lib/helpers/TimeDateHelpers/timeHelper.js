const {
    intervalToDuration,
    formatDuration,
    startOfTomorrow,
    format,
    formatDistanceToNowStrict,
    getUnixTime,
    parse,
    differenceInYears,
    addWeeks,
    endOfHour,
    startOfWeek,
    nextDay
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
     * Get time until a target time
     * @param {string} target - 'nextHour' | 'tomorrow' | 'nextWeek'
     * @returns {string} Formatted duration string
     */
    getTimeUntil: (target = 'tomorrow') => {
        const now = new Date();
        let endDate;

        switch (target.toLowerCase()) {
            case 'nexthour':
                endDate = endOfHour(now);
                break;
            case 'tomorrow':
                endDate = startOfTomorrow();
                break;
            case 'nextweek':
                endDate = startOfWeek(addWeeks(now, 1), { weekStartsOn: 1 });
                break;
            default:
                throw new Error('Invalid target. Use: nextHour, tomorrow, or nextWeek');
        }

        const duration = intervalToDuration({ start: now, end: endDate });

        return formatDuration(duration, {
            format: ['days', 'hours', 'minutes'],
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

    /**
     * Get the date of next occuring date and time
     * @param {*} day - The day of the week (Sunday = 0)
     * @param {*} time - The time of the day (eg: 13:45)
     */
    getNextOccurence(day, time) {
        const now = new Date();
        try {
            const next = nextDay(now, day);
            const [hours, minutes] = time.split(':');
            const nextDate = (next.getDay() === now.getDay() && new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes) > now) ?
                new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes) :
                new Date(next.getFullYear(), next.getMonth(), next.getDate(), hours, minutes);
            return nextDate;
        }
        catch (error) {
            console.error('Invalid day or time:', error);
            return null;
        }
    },
};