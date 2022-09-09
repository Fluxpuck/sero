/*  Fluxpuck © Creative Commons Attribution-NoDerivatives 4.0 International Public License  
    This file contains some basic javascript functions */

module.exports = {

    /** convert timestamp to 2400 time object
     * @param {String} t Time object
     */
    time(t) {
        //check if (t) is a valid time string
        let valid = (new Date(t)).getTime() > 0;
        if (valid == true) {
            let time =
                ("0" + t.getHours()).slice(-2) + ":" +
                ("0" + t.getMinutes()).slice(-2);
            return time
        } else return undefined
    },

    /** convert milliseconds to hours, minutes, and seconds
     * @param {*} t 
     * @returns 
     */
    msToTime(t) {
        //get hours, minutes and seconds
        const date = new Date(t * 1000);
        const days = date.getUTCDate() - 1,
            hours = date.getUTCHours(),
            minutes = date.getUTCMinutes(),
            seconds = date.getUTCSeconds()
        let segments = []; //prepare array
        //seperate in segments
        if (days > 0) segments.push(days + ' day' + ((days == 1) ? '' : 's'));
        if (hours > 0) segments.push(hours + ' hr' + ((hours == 1) ? '' : 's'));
        if (minutes > 0) segments.push(minutes + ' min' + ((minutes == 1) ? '' : 's'));
        if (seconds > 0) segments.push(seconds + ' sec' + ((seconds == 1) ? '' : 's'));
        const dateString = segments.join(', ');
        return dateString //return to user
    },

    /** capitalize full string
     * @param {String} str String object
     */
    capitalize(str) {
        return str.replace(
            /\w\S*/g,
            function (txt) {
                if (txt.charAt(0) == "'") {
                    return
                } else {
                    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
                }
            }
        );
    },

    /** clean the string object
    * @param {String} string String object
    */
    clean(client, string) {
        if (typeof string === 'string') {
            return string
                .replace(/`/g, '`' + String.fromCharCode(8203))
                .replace(/@/g, '@' + String.fromCharCode(8203))
                .replace(/token/i, '' + String.fromCharCode(8203))
                .replace(client.token || process.env.TOKEN, '')
        } else {
            return string;
        }
    },

    /** slice array in chunks
     * @param {Array} array Lenghy array
     * @param {Number} chunk Chunk size
     */
    chunk(array, chunk) {
        let i, j, temp, returnArray = [];
        for (i = 0, j = array.length; i < j; i += chunk) {
            returnArray.push(temp = array.slice(i, i + chunk));
        }
        return returnArray;
    },

    /** get timestamp from snowflake
     * @param {*} input 
     * @returns 
     */
    convertSnowflake(input) {
        /* set default discord EPOCH from discord documentation
        https://discord.com/developers/docs/reference#snowflakes */
        const DISCORD_EPOCH = 1420070400000

        //convert input (string) to Number
        let snowflake = Number(input)

        //if snowflake is not an number, return false
        if (!Number.isInteger(snowflake)) return false
        //if snowflake is too short, return false
        if (snowflake < 4194304) return false

        //convert snowflake to timestamp
        let timestamp = new Date(snowflake / 4194304 + DISCORD_EPOCH)

        //return timestamp
        return timestamp
    },

    validURL(str) {
        var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
            '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
        return !!pattern.test(str);
    },

    getUrlFileType(url) {
        const u = new URL(url)
        const ext = u.pathname.split(".").pop()
        return ext === "/"
            ? undefined
            : ext.toLowerCase()
    },

    charIsLetter(char) {
        if (typeof char !== 'string') return false;
        return char.toLowerCase() !== char.toUpperCase();
    }

};