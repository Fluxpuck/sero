module.exports = {

    findValues(obj, keysToFind = ['user', 'author', 'member', 'guild', 'channel', 'message']) {
        // Store results for each key
        const results = {};

        // Initialize results for each key to an empty array
        keysToFind.forEach(key => {
            results[key] = [];
        });

        function search(obj, seenObjects = new Set()) {
            // Ensure obj is an object and not empty before proceeding
            if (obj && typeof obj === 'object' && Object.keys(obj).length > 0) {
                // Check for circular references
                if (seenObjects.has(obj)) {
                    return;
                }
                seenObjects.add(obj);

                // Iterate over all properties in the object
                for (const key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        // Check if the current key is one we're looking for
                        if (keysToFind.includes(key)) {
                            results[key].push(obj[key]); // Store the found value
                        }

                        // If the value is an object, continue searching recursively
                        if (typeof obj[key] === 'object' && obj[key] !== null) {
                            search(obj[key], seenObjects);
                        }
                    }
                }
            }
        }

        // Start searching from the root object
        search(obj);

        // Combine results into a single "user" key based on priority: user > author > member
        const combinedResult = {};

        if (results['user'].length > 0) {
            combinedResult['user'] = results['user'][0];
        } else if (results['author'].length > 0) {
            combinedResult['user'] = results['author'][0];
        } else if (results['member'].length > 0) {
            combinedResult['user'] = results['member'][0];
        }

        // Add other keys to the results that are not "user", "author", or "member"
        keysToFind.forEach(key => {
            if (!['user', 'author', 'member'].includes(key) && results[key].length > 0) {
                combinedResult[key] = results[key];
            }
        });

        return combinedResult;
    }
};