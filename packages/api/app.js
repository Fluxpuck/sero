require('module-alias/register');

// → Require Packages & Modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const { join } = require('path');

// → Load Environment Variables
require("dotenv").config({ path: join(__dirname, '.', 'config', '.env') });

// → Load Cron Job Manager
require('./utils/jobManager');

(async () => {
    // → Setup server
    const app = express();
    const port = 3336;

    // → Adding Helmet to enhance API security
    app.use(helmet());

    // → Using bodyParser to parse JSON bodies into JS objects
    app.use(bodyParser.json());

    // → Enabling CORS for all requests
    app.use(cors());

    // → Logging the HTTP requests
    const logger = require('./middleware/logging');
    app.use(logger);

    // → Mount API routes to App
    const routes = require("./middleware/routes");
    routes.run(app);

    // → Register error handler middleware
    const { errorHandler } = require('./middleware/errorHandler');
    app.use(errorHandler);

    // → Sync Database Connection
    const t0 = performance.now();
    let { sequelize } = require("./database/sequelize");
    await sequelize.sync();
    const t1 = performance.now();

    // → Connect to Redis
    const { redisClient } = require('./database/publisher');

    // → Start server
    await app.listen(port, () => {
        return console.log(`
    RESTFUL API - Startup details:
    > ${new Date().toUTCString()}
    > Database Synced in ${Math.round(t1 - t0)} milliseconds
    > Ready on http://localhost:${port}
    > ${redisClient.status === 'ready' ? 'Redis is connected' : 'Redis is not connected!'}
        `)
    });

    // → Start Health Checks
    const { startHealthChecks } = require('./database/healthCheck');
    startHealthChecks();

})();