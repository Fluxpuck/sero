/* RESTFUL API for Flux
 Intented for Private use only
 Copyright © 2023
*/

// → Require Packages & Modules
const express = require("express");
const router = express.Router();
const { readdirSync } = require("fs");
const { join } = require("path");

// → get Package information
const { version, name, description, github } = require("../package.json");

// → Define the routes for 'api/info'

/**
 * Get default information on the API
 */
router.get("/", async (req, res, next) => {

  //get all routes
  const filePath = join(__dirname, "..", "routes");
  const routeFiles = readdirSync(filePath);

  return res.json({
    "information": {
      name: name,
      description: description,
      version: version
    },
    "application": {
      user: req.user,
      endpoints: routeFiles.map(r => `/${r.split(".").shift()}`),
      rateLimit: req.ratelimit
    },
    "github": github
  });
});

// → Export Router to App
module.exports = router;