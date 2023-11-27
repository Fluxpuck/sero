const { Sequelize } = require('sequelize');
const { join } = require('path');
require('dotenv').config({ path: join(__dirname, '..', 'config', '.env') });

// Function to create and return a Sequelize instance
function createSequelizeInstance() {
    const {
        REMOTE_HOST, REMOTE_DB, REMOTE_USER, REMOTE_PASS, REMOTE_PORT,
        LOCAL_HOST, LOCAL_DB, LOCAL_USER, LOCAL_PASS, LOCAL_PORT,
        NODE_ENV
    } = process.env;

    try {
        const sequelize = new Sequelize(
            NODE_ENV === 'production' ? REMOTE_DB : LOCAL_DB,
            NODE_ENV === 'production' ? REMOTE_USER : LOCAL_USER,
            NODE_ENV === 'production' ? REMOTE_PASS : LOCAL_PASS,
            {
                host: NODE_ENV === 'production' ? REMOTE_HOST : LOCAL_HOST,
                port: NODE_ENV === 'production' ? REMOTE_PORT : LOCAL_PORT,
                dialect: 'postgres',
                logging: false, // Disable logging or provide a custom logging function
            }
        );
        return sequelize;
    } catch (error) {
        throw new Error(`Error creating Sequelize instance: ${error.message}`);
    }
}

// Function to check the database connection
async function checkDatabaseConnection(sequelize) {
    try {
        await sequelize.authenticate();
    } catch (error) {
        throw new Error(`Unable to connect to the database: ${error.message}`);
    }
}

// Create Sequelize instance
const sequelize = createSequelizeInstance();

// Check database connection
checkDatabaseConnection(sequelize);

module.exports = { sequelize };