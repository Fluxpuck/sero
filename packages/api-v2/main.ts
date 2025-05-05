import 'reflect-metadata';
import express from 'express';

(async () => {

    // → Setup server
    const app = express();
    const port = 3336;

    // →  Parse request to JSON
    app.use(express.json());

    // → Mount routes to the server
    const routes = await require('./middleware/routes');
    routes.run(app);

    // → Sync Database Connection
    const start = performance.now();
    await require('./database/sequelize').sequelize.sync();
    const end = performance.now();

    // → Start server
    app.listen(port, () => {
        return console.log(`
    RESTFUL API - Startup details:
    > ${new Date().toUTCString()}
    > Database Synced in ${Math.round(end - start)} milliseconds
    > Ready on http://localhost:${port}
        `)
    });

})();