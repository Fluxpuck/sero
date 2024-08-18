const express = require("express");
const router = express.Router();

// Define the routes for the client

router.get("/", (req, res) => {
    res.status(200).send('Hello, World!');
});

module.exports = router;