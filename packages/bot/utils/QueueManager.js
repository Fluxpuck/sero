class UpdateQueue {
    constructor(processFunction, delay = 20000) {
        this.queue = new Map();
        this.processFunction = processFunction;
        this.delay = delay;
    }

    addUpdate(key, data) {
        const currentTime = Date.now();

        if (!this.queue.has(key)) {
            this.queue.set(key, {
                updates: [],
                timer: null
            });
        }

        const queueItem = this.queue.get(key);
        queueItem.updates.push({ ...data, timestamp: currentTime });

        // Clear existing timer if there is one
        if (queueItem.timer) {
            clearTimeout(queueItem.timer);
        }

        // Set new timer
        queueItem.timer = setTimeout(() => this.processUpdates(key), this.delay);
    }

    async processUpdates(key) {
        const queueItem = this.queue.get(key);
        if (!queueItem) return;

        const { updates } = queueItem;

        try {
            await this.processFunction(key, updates);
        } catch (error) {
            console.error(`Error processing updates for ${key}:`, error);
        }

        // Remove the processed updates from the queue
        this.queue.delete(key);
    }
}

module.exports = UpdateQueue;