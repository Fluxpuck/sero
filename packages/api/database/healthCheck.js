const { sequelize } = require('./sequelize');

// Health check interval (in ms)
const HEALTH_CHECK_INTERVAL = 60_000; // 1 minute

// Create a health check function
const checkDatabaseHealth = async () => {
    try {
        // Simple query to test database connectivity
        await sequelize.query('SELECT 1+1 AS result');
        return true;
    } catch (error) {
        console.error('Database health check failed:', error.message);
        return false;
    }
};

// Start periodic health checks
const startHealthChecks = () => {
    setInterval(async () => {
        const isHealthy = await checkDatabaseHealth();

        if (!isHealthy) {
            console.error('Database connectivity issues detected!');
            // Optional: Implement recovery mechanisms here
        }
    }, HEALTH_CHECK_INTERVAL);

    console.log('Database health check monitoring started');
};

module.exports = { checkDatabaseHealth, startHealthChecks };