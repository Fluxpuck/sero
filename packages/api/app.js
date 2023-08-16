/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Require Packages & Modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");

// → Get credentials
require("dotenv").config({ path: "./config/.env" });

(async () => {
    // → Setup server
    const app = express();
    const port = 3000;

    // → Adding Helmet to enhance API security
    app.use(helmet());

    // → Using bodyParser to parse JSON bodies into JS objects
    app.use(bodyParser.json());

    // → Enabling CORS for all requests
    app.use(cors());

    // → Adding morgan to log HTTP request
    const logger = require("./middleware/logging");
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
    await sequelize.sync({ logging: false });
    const t1 = performance.now();

    // → Start server
    await app.listen(port, () => {
        return console.log(`
RESTFUL API - Startup details:
> ${new Date().toUTCString()}
> Sequelize Synced in ${Math.round(t1 - t0)} milliseconds.
> Ready on http://localhost:${port}
`)
    });

    // Injects demo data on launch
    // const demoData = require('./test/demoData');
    // await demoData.run();

})();