/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Require Packages & Modules
const { Sequelize } = require('sequelize');

// → Setup Sequelize
let sequelize;

if (process.env.NODE_ENV === 'production') {
    // Run production-specific code
    // → Connect to the remote postgresql database
    sequelize = new Sequelize(
        process.env.REMOTE_DB,
        process.env.REMOTE_USER,
        process.env.REMOTE_PASS,
        {
            host: process.env.REMOTE_HOST,
            dialect: 'postgres',
            logging: (message) => {
                console.log(`Sequelize: ${message}`);
            }
        }
    );
} else {
    // Run development-specific code
    // → Connect to the local postgresql database
    sequelize = new Sequelize(
        process.env.LOCAL_POST,
        process.env.LOCAL_POST,
        process.env.LOCAL_POST,
        {
            host: process.env.LOCAL_HOST,
            port: process.env.LOCAL_PORT,
            dialect: 'postgres',
            logging: (message) => {
                console.log(`Sequelize: ${message}`);
            }
        }
    );
}

// → Export Database Function
module.exports = { sequelize };