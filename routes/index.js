const express = require('express');
const router = express.Router();
const userRouter = require('./userRoutes');
const locationRouter = require('./locationRoutes');
const resultRouter = require('./resultRoutes');
const configRouter = require('./configRoutes');

router.use('/auth', userRouter);
router.use('/location', locationRouter);
router.use('/result', resultRouter);
router.use('/config', configRouter);

module.exports = router;
