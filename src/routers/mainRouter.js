const express = require('express');

const studentRouter = require('./studentRouter');

const router = express.Router();

router.use('/student', studentRouter);

module.exports = router;
