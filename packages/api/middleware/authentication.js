/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Require Packages & Modules
const { createError } = require('../utils/ClassManager');

// → Export module's function
module.exports = {

    authenticate(req, res, next) {

        //get token from request header
        const userToken = req.headers.authorization;
        if (!userToken) next(new createError(404, 'No authorization key provided'));

        try {
            if (userToken === process.env.API_MASTER_KEY) return next();
        } catch (error) {
            next(new createError(404, 'Sorry, invalid API key provided'))
        }

    }

}