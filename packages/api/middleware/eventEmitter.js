// Create an instance of EventEmitter
const EventEmitter = require('events');
const eventEmitter = new EventEmitter();

// Define the enum for event names
const EventNames = {
    LEVELS_RANK_UP: 'LEVELS_RANK_UP',
    LEVELS_RANK_DOWN: 'LEVELS_RANK_DOWN',
};

// Define the schema for eventData
const eventDataSchema = {
    eventName: 'string',
    route: 'string',
    timestamp: 'number',
    data: 'object',
};

// Function to assert that eventData matches the schema
function assertEventData(eventData) {
    for (const key in eventDataSchema) {
        if (!(key in eventData) || typeof eventData[key] !== eventDataSchema[key]) {
            throw new Error(`Invalid eventData structure: ${key} is missing or has an invalid type`);
        }
    }
}

module.exports = {
    emitEventMiddleware(eventName, eventData) {
        return () => {
            try {
                // Check if the eventName is a valid enum value
                if (!(eventName in EventNames)) {
                    throw new Error(`Invalid eventName: ${eventName}`);
                }

                // Assert that eventData matches the schema
                assertEventData(eventData);

                // Emit the event with data
                eventEmitter.emit(eventName, eventData);

            } catch (error) {
                // Handle errors
                console.error('Error emitting event:', error);
            }
        };
    },

    // Register an event listener
    on(eventName, listener) {
        eventEmitter.on(eventName, listener);
    },

    // Remove an event listener
    off(eventName, listener) {
        eventEmitter.off(eventName, listener);
    }
};