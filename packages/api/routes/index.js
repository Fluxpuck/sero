const express = require("express");
const router = express.Router();

const { name, version } = require('../package.json');

router.get("/", (req, res) => {
    res.status(200).json({ name, version, message: 'Fluxpuck likes secret messages' });
});

module.exports = router;