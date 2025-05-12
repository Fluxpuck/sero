import 'reflect-metadata';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import compression from 'compression';

(async () => {

    // → Setup server
    const app = express();
    const port = process.env.PORT || 3336;

    // → Apply security middleware
    app.use(helmet());
    // → Enable CORS & Compression
    app.use(cors());
    app.use(compression());

    // → Basic rate limiting
    app.use(rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again later'
    }));

    // → Parse request bodies
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // → Mount routes to the server
    const routes = await require('./middleware/routes');
    routes.run(app);

    // → Use the custom 404 and error handlers
    const { notFoundHandler, errorHandler } = require('./middleware/error');
    app.use(notFoundHandler);
    app.use(errorHandler);

    // → Sync Database Connection
    const start = performance.now();
    const { sequelize } = require('./database/sequelize');
    await sequelize.sync();
    const end = performance.now();

    // → Start server
    app.listen(port, () => {
        return console.log(`
    RESTFUL API - Startup details:
    > ${new Date().toUTCString()}
    > Database Synced in ${Math.round(end - start)} milliseconds
    > Running in ${process.env.NODE_ENV || 'development'} mode
    > Ready on http://localhost:${port}
        `)
    });

})();