const { Sequelize } = require('sequelize');
const { join } = require('path');
require('dotenv').config({ path: join(__dirname, '..', 'config', '.env') });

let sequelize;

try {
    if (process.env.NODE_ENV === 'production') {
        // Connect to the remote PostgreSQL database in production
        sequelize = new Sequelize(
            process.env.REMOTE_DB,
            process.env.REMOTE_USER,
            process.env.REMOTE_PASS,
            {
                host: process.env.REMOTE_HOST,
                dialect: 'postgres',
            }
        );
    } else {
        // Connect to the local PostgreSQL database in development
        sequelize = new Sequelize(
            process.env.LOCAL_DB,
            process.env.LOCAL_POST,
            process.env.LOCAL_POST,
            {
                host: process.env.LOCAL_HOST,
                port: process.env.LOCAL_PORT,
                dialect: 'postgres',
                logging: false, // Disable logging or provide a custom logging function
            }
        );
    }
} catch (error) {
    console.error('Error connecting to the database:', error.message);
}

// Export the Sequelize instance for database operations
module.exports = sequelize;