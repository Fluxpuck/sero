const { findValues } = require('../lib/resolvers/objectResolver')

module.exports = {

    activity_logger(event, data, next) {

        if (process.env.NODE_ENV === "development") {

            // List of keys to find
            const foundValues = findValues(data);

            console.groupCollapsed("\x1b[36m", `[Client]: ${event}`);
            console.log(foundValues);
            console.groupEnd();
        }

        next();
    }
}